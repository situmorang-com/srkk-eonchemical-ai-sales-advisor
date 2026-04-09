/**
 * AI Sales Advisor — Deterministic Recommendation Engine
 * ────────────────────────────────────────────────────────
 * Scores products for an opportunity using four signals:
 *   1. Industry Fit        — product × industry fit table
 *   2. Similar Account     — what similar accounts have bought
 *   3. Product Affinity    — what this account has bought before
 *   4. Use-Case Fit        — keyword match between opportunity and product use-case
 *
 * Each signal produces a 0-1 score. The composite confidence is a
 * weighted average. The top-scoring product is the primary recommendation.
 * The second-highest from a DIFFERENT family = upsell.
 * A complementary product from the account's existing family = cross-sell.
 */

import { db } from '../db';
import {
	products, productFamilies, productIndustryFit,
	accountProductHistory, accounts, recommendations,
	industries, opportunities, opportunityStages
} from '../db/schema';
import { eq, and, ne, desc } from 'drizzle-orm';
import type { RecommendationResult, ProductSummary } from '$lib/types';

interface ScoredProduct {
	productId:       string;
	productName:     string;
	sku:             string;
	familyId:        string;
	familyName:      string;
	unitPrice:       number;
	uom:             string;
	primaryUseCase:  string | null;
	industryScore:   number;
	similarScore:    number;
	affinityScore:   number;
	useCaseScore:    number;
	composite:       number;
}

const WEIGHTS = {
	industry:  0.35,
	similar:   0.25,
	affinity:  0.20,
	useCase:   0.20
};

// ─── Use-case keyword matching ────────────────────────────────────────────────

function useCaseKeywordScore(
	opportunity: { problemStatement: string | null; useCase: string | null },
	productUseCase: string | null
): number {
	const oppText = [opportunity.problemStatement, opportunity.useCase]
		.filter(Boolean)
		.join(' ')
		.toLowerCase();

	if (!oppText || !productUseCase) return 0.1;

	const productKeywords = productUseCase.toLowerCase().split(/[\s,;/]+/).filter((w) => w.length > 3);
	if (!productKeywords.length) return 0.1;

	const hits = productKeywords.filter((kw) => oppText.includes(kw)).length;
	return Math.min(1, hits / productKeywords.length + (hits > 0 ? 0.2 : 0));
}

// ─── Explanation text generator ───────────────────────────────────────────────

function buildPrimaryReasoning(product: ScoredProduct, industryName: string, similarCount: number): string {
	const parts: string[] = [];

	if (product.industryScore >= 0.7) {
		parts.push(`${product.productName} has a high industry fit score (${Math.round(product.industryScore * 100)}%) for the ${industryName} sector`);
	} else if (product.industryScore >= 0.4) {
		parts.push(`${product.productName} is a moderate fit for the ${industryName} sector`);
	}

	if (product.affinityScore >= 0.5) {
		parts.push(`this account has purchased from the ${product.familyName} family before`);
	}

	if (product.similarScore >= 0.5 && similarCount > 0) {
		parts.push(`${similarCount} similar ${industryName} accounts regularly purchase this product`);
	}

	if (product.useCaseScore >= 0.4) {
		parts.push(`product use-case aligns with the stated problem statement`);
	}

	if (!parts.length) {
		parts.push(`based on the product's overall fit profile and pricing position`);
	}

	return parts.map((p, i) => i === 0 ? p.charAt(0).toUpperCase() + p.slice(1) : p).join('; ') + '.';
}

function buildUpsellReasoning(upsell: ScoredProduct, primary: ScoredProduct): string {
	return `${upsell.productName} (${upsell.familyName}) complements ${primary.productName} and serves the same application environment. Proposing both increases average order value and reduces the customer's vendor count.`;
}

function buildCrossSellReasoning(crossSell: ScoredProduct, account: { name: string }): string {
	return `${account.name} already purchases from the ${crossSell.familyName} family. ${crossSell.productName} addresses an adjacent chemistry need and can be proposed alongside the primary recommendation to leverage existing supplier trust.`;
}

function buildNextBestAction(opp: {
	isStalled: boolean; stalledDays: number; stageCode: string;
	problemStatement: string | null; daysSinceLastActivity?: number | null;
}): { action: string; reasoning: string } {
	if (opp.isStalled && opp.stalledDays > 21) {
		return {
			action: 'Schedule executive re-engagement call',
			reasoning: `This deal has been stalled for ${opp.stalledDays} days. A senior-level call is needed to re-establish urgency and uncover blockers.`
		};
	}
	if (opp.isStalled) {
		return {
			action: 'Send technical data sheet and request feedback',
			reasoning: `No movement for ${opp.stalledDays} days. Re-engage with technical content to test if the champion is still active.`
		};
	}

	switch (opp.stageCode) {
		case 'PROSPECT':
			return {
				action: 'Book a discovery call to qualify pain points',
				reasoning: 'Early-stage opportunity. Confirm problem statement, decision-maker, and budget before investing further.'
			};
		case 'QUALIFY':
			return {
				action: 'Send product comparison matrix and request a site visit',
				reasoning: 'Qualification is underway. A site visit will expose technical requirements and strengthen the relationship.'
			};
		case 'PROPOSE':
			return {
				action: 'Submit formal quotation and schedule a proposal review meeting',
				reasoning: 'The opportunity is in proposal stage. A formal quote with clear pricing and delivery terms is the next logical step.'
			};
		case 'NEGOTIATE':
			return {
				action: 'Prepare commercial concession strategy before next call',
				reasoning: 'Negotiation stage. Enter the next conversation with a prepared fallback to protect margin while closing.'
			};
		case 'CLOSE':
			return {
				action: 'Send purchase order template and confirm delivery logistics',
				reasoning: 'The deal is at close stage. Remove friction by proactively providing paperwork and logistics confirmation.'
			};
		default:
			return {
				action: 'Review account and schedule a touchpoint this week',
				reasoning: 'No stage-specific action identified. A general check-in will help maintain momentum.'
			};
	}
}

// ─── Main engine function ─────────────────────────────────────────────────────

export async function generateRecommendation(
	opportunityId: string
): Promise<RecommendationResult | null> {

	// 1. Load opportunity + stage in a single join
	const [oppWithStage] = await db
		.select({
			id:               opportunities.id,
			accountId:        opportunities.accountId,
			primaryProductId: opportunities.primaryProductId,
			problemStatement: opportunities.problemStatement,
			useCase:          opportunities.useCase,
			isStalled:        opportunities.isStalled,
			stalledDays:      opportunities.stalledDays,
			stageCode:        opportunityStages.code
		})
		.from(opportunities)
		.leftJoin(opportunityStages, eq(opportunities.stageId, opportunityStages.id))
		.where(eq(opportunities.id, opportunityId));

	if (!oppWithStage) return null;

	// 2. Load account + industry
	const [account] = await db
		.select({ id: accounts.id, name: accounts.name, industryId: accounts.industryId, industryName: industries.name })
		.from(accounts)
		.leftJoin(industries, eq(accounts.industryId, industries.id))
		.where(eq(accounts.id, oppWithStage.accountId));

	if (!account) return null;

	// 3. Load all active products with their industry fit scores
	const allProductFits = await db
		.select({
			productId:   products.id,
			productName: products.name,
			sku:         products.sku,
			familyId:    products.familyId,
			familyName:  productFamilies.name,
			unitPrice:   products.unitPrice,
			uom:         products.uom,
			primaryUseCase: products.primaryUseCase,
			industryId:  productIndustryFit.industryId,
			fitScore:    productIndustryFit.fitScore,
			useCase:     productIndustryFit.useCase
		})
		.from(productIndustryFit)
		.innerJoin(products, eq(productIndustryFit.productId, products.id))
		.leftJoin(productFamilies, eq(products.familyId, productFamilies.id))
		.where(and(eq(productIndustryFit.industryId, account.industryId), eq(products.isActive, true)));

	if (!allProductFits.length) return null;

	// 4. Load this account's purchase history (affinity signal)
	const ownHistory = await db
		.select({ productId: accountProductHistory.productId, familyId: products.familyId })
		.from(accountProductHistory)
		.innerJoin(products, eq(accountProductHistory.productId, products.id))
		.where(eq(accountProductHistory.accountId, account.id));

	const ownProductIds  = new Set(ownHistory.map((h) => h.productId));
	const ownFamilyIds   = new Set(ownHistory.map((h) => h.familyId));

	// 5. Load similar accounts' purchase history (collaborative signal)
	const similarAccounts = await db
		.select({ id: accounts.id })
		.from(accounts)
		.where(and(eq(accounts.industryId, account.industryId), ne(accounts.id, account.id)))
		.limit(10);

	const similarAccountIds = similarAccounts.map((a) => a.id);

	// Map: productId -> count of similar accounts that bought it
	const similarPurchaseMap = new Map<string, number>();
	if (similarAccountIds.length) {
		for (const saId of similarAccountIds) {
			const hist = await db
				.select({ productId: accountProductHistory.productId })
				.from(accountProductHistory)
				.where(eq(accountProductHistory.accountId, saId));
			for (const h of hist) {
				similarPurchaseMap.set(h.productId, (similarPurchaseMap.get(h.productId) ?? 0) + 1);
			}
		}
	}

	const maxSimilarCount = Math.max(1, ...similarPurchaseMap.values());

	// 6. Score each product
	const scored: ScoredProduct[] = allProductFits.map((pf) => {
		const industryScore = pf.fitScore ?? 0;

		const similarRaw   = similarPurchaseMap.get(pf.productId) ?? 0;
		const similarScore = similarRaw / maxSimilarCount;

		// Affinity: purchased exact product = 1.0, same family = 0.5
		const affinityScore = ownProductIds.has(pf.productId) ? 1.0
			: ownFamilyIds.has(pf.familyId ?? '') ? 0.5
			: 0;

		const useCaseScore = useCaseKeywordScore(oppWithStage, pf.primaryUseCase ?? pf.useCase);

		const composite =
			WEIGHTS.industry  * industryScore +
			WEIGHTS.similar   * similarScore  +
			WEIGHTS.affinity  * affinityScore +
			WEIGHTS.useCase   * useCaseScore;

		return {
			productId:   pf.productId,
			productName: pf.productName,
			sku:         pf.sku,
			familyId:    pf.familyId ?? '',
			familyName:  pf.familyName ?? 'Unknown',
			unitPrice:   pf.unitPrice,
			uom:         pf.uom,
			primaryUseCase: pf.primaryUseCase,
			industryScore,
			similarScore,
			affinityScore,
			useCaseScore,
			composite
		};
	});

	// Deduplicate by productId (take max composite)
	const bestByProduct = new Map<string, ScoredProduct>();
	for (const s of scored) {
		const existing = bestByProduct.get(s.productId);
		if (!existing || s.composite > existing.composite) {
			bestByProduct.set(s.productId, s);
		}
	}

	const ranked = [...bestByProduct.values()].sort((a, b) => b.composite - a.composite);

	if (!ranked.length) return null;

	const primary = ranked[0];

	// Upsell: top product from a DIFFERENT family
	const upsell = ranked.find((p) => p.familyId !== primary.familyId) ?? null;

	// Cross-sell: top product from a family the account ALREADY buys, different from primary family
	const crossSell = ranked.find(
		(p) => p.familyId !== primary.familyId && ownFamilyIds.has(p.familyId)
	) ?? null;

	const { action: nextBestAction, reasoning: actionReasoning } = buildNextBestAction({
		isStalled: oppWithStage.isStalled,
		stalledDays: oppWithStage.stalledDays,
		stageCode: oppWithStage.stageCode ?? 'PROSPECT',
		problemStatement: oppWithStage.problemStatement
	});

	const toProductSummary = (p: ScoredProduct): ProductSummary => ({
		id:             p.productId,
		name:           p.productName,
		sku:            p.sku,
		familyName:     p.familyName,
		unitPrice:      p.unitPrice,
		uom:            p.uom,
		primaryUseCase: p.primaryUseCase
	});

	const result: RecommendationResult = {
		id:                   `rec-${opportunityId}-${Date.now()}`,
		primaryProduct:       toProductSummary(primary),
		upsellProduct:        upsell ? toProductSummary(upsell) : null,
		crossSellProduct:     crossSell ? toProductSummary(crossSell) : null,
		confidenceScore:      Math.round(primary.composite * 100) / 100,
		scoreBreakdown: {
			industryFit:     Math.round(primary.industryScore * 100) / 100,
			similarAccounts: Math.round(primary.similarScore * 100) / 100,
			affinity:        Math.round(primary.affinityScore * 100) / 100,
			useCaseFit:      Math.round(primary.useCaseScore * 100) / 100
		},
		primaryReasoning:  buildPrimaryReasoning(primary, account.industryName ?? 'this industry', similarPurchaseMap.get(primary.productId) ?? 0),
		upsellReasoning:   upsell   ? buildUpsellReasoning(upsell, primary)               : null,
		crossSellReasoning: crossSell ? buildCrossSellReasoning(crossSell, { name: account.name }) : null,
		nextBestAction,
		actionReasoning,
		isAdopted:   false,
		generatedAt: new Date().toISOString()
	};

	// Persist recommendation
	try {
		await db.insert(recommendations).values({
			id:                   result.id,
			opportunityId:        opportunityId,
			accountId:            account.id,
			primaryProductId:     primary.productId,
			upsellProductId:      upsell?.productId ?? null,
			crossSellProductId:   crossSell?.productId ?? null,
			confidenceScore:      result.confidenceScore,
			industryFitScore:     result.scoreBreakdown.industryFit,
			similarAccountScore:  result.scoreBreakdown.similarAccounts,
			affinityScore:        result.scoreBreakdown.affinity,
			useCaseFitScore:      result.scoreBreakdown.useCaseFit,
			primaryReasoning:     result.primaryReasoning,
			upsellReasoning:      result.upsellReasoning ?? null,
			crossSellReasoning:   result.crossSellReasoning ?? null,
			nextBestAction:       result.nextBestAction,
			actionReasoning:      result.actionReasoning ?? null,
			isAdopted:            false
		});
	} catch {
		// Non-fatal: recommendation still returned even if persistence fails
	}

	return result;
}

export async function getStoredRecommendation(opportunityId: string): Promise<RecommendationResult | null> {
	const [rec] = await db
		.select()
		.from(recommendations)
		.where(eq(recommendations.opportunityId, opportunityId))
		.orderBy(desc(recommendations.generatedAt))
		.limit(1);

	if (!rec) return null;

	const getProduct = async (id: string | null): Promise<ProductSummary | null> => {
		if (!id) return null;
		const [p] = await db
			.select({
				id:             products.id,
				name:           products.name,
				sku:            products.sku,
				familyName:     productFamilies.name,
				unitPrice:      products.unitPrice,
				uom:            products.uom,
				primaryUseCase: products.primaryUseCase
			})
			.from(products)
			.leftJoin(productFamilies, eq(products.familyId, productFamilies.id))
			.where(eq(products.id, id));
		if (!p) return null;
		return { ...p, familyName: p.familyName ?? 'Unknown' };
	};

	const [primaryProduct, upsellProduct, crossSellProduct] = await Promise.all([
		getProduct(rec.primaryProductId),
		getProduct(rec.upsellProductId),
		getProduct(rec.crossSellProductId)
	]);

	if (!primaryProduct) return null;

	return {
		id:              rec.id,
		primaryProduct,
		upsellProduct,
		crossSellProduct,
		confidenceScore: rec.confidenceScore,
		scoreBreakdown: {
			industryFit:     rec.industryFitScore,
			similarAccounts: rec.similarAccountScore,
			affinity:        rec.affinityScore,
			useCaseFit:      rec.useCaseFitScore
		},
		primaryReasoning:   rec.primaryReasoning,
		upsellReasoning:    rec.upsellReasoning,
		crossSellReasoning: rec.crossSellReasoning,
		nextBestAction:     rec.nextBestAction,
		actionReasoning:    rec.actionReasoning,
		isAdopted:          rec.isAdopted,
		generatedAt:        rec.generatedAt
	};
}
