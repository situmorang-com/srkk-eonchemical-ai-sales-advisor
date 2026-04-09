import { db } from '../db';
import { recommendations, products, productFamilies } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import type { RecommendationResult, ProductSummary } from '$lib/types';

export async function getLatestRecommendationByOpportunity(opportunityId: string): Promise<RecommendationResult | null> {
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
		id: rec.id,
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
