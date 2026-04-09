/**
 * AI Copilot Service — Mock AI responses generated from real app data
 * ─────────────────────────────────────────────────────────────────────
 * Generates context-aware responses using data from the recommendation
 * engine and database. No external LLM dependency in MVP.
 */

import { getOpportunityById } from '../repositories/opportunity.repository';
import { getAccountById } from '../repositories/account.repository';
import { generateRecommendation, getStoredRecommendation } from './recommendation.engine';
import { getDashboardData } from './dashboard.service';
import type { CopilotRequest, CopilotResponse, CopilotSource } from '$lib/types';

function fmt(n: number, _currency = 'IDR'): string {
	return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

function confidenceLabel(score: number): string {
	if (score >= 0.75) return 'High';
	if (score >= 0.5)  return 'Medium';
	return 'Low';
}

// ─── Intent detection ─────────────────────────────────────────────────────────

type Intent =
	| 'what_to_propose'
	| 'why_stuck'
	| 'upsell_crosssell'
	| 'account_overview'
	| 'pipeline_summary'
	| 'next_action'
	| 'general';

function detectIntent(message: string): Intent {
	const m = message.toLowerCase();
	if (/what.*(propose|recommend|sell|product|pitch)/i.test(m))        return 'what_to_propose';
	if (/why.*(stuck|stall|slow|move|progress|dead)/i.test(m))          return 'why_stuck';
	if (/deal.*(stuck|stall)|stuck|stall/i.test(m))                      return 'why_stuck';
	if (/upsell|cross.?sell|additional|more product/i.test(m))           return 'upsell_crosssell';
	if (/account|customer|client|company/i.test(m))                      return 'account_overview';
	if (/pipeline|summary|dashboard|overview|team/i.test(m))             return 'pipeline_summary';
	if (/next.*(step|action|do|move)|what should i do/i.test(m))         return 'next_action';
	return 'general';
}

// ─── Response generators ──────────────────────────────────────────────────────

async function handleWhatToPropose(
	contextType?: string, contextId?: string
): Promise<CopilotResponse> {
	const sources: CopilotSource[] = [];

	if (contextType === 'opportunity' && contextId) {
		let rec = await getStoredRecommendation(contextId);
		if (!rec) rec = await generateRecommendation(contextId);

		const opp = await getOpportunityById(contextId);
		if (!rec || !opp) {
			return { content: "I wasn't able to generate a recommendation for this opportunity. Please ensure the account has industry data configured.", sources: [] };
		}

		sources.push({ type: 'opportunity', id: contextId, label: opp.name });
		sources.push({ type: 'product', id: rec.primaryProduct.id, label: rec.primaryProduct.name });
		if (rec.upsellProduct) sources.push({ type: 'product', id: rec.upsellProduct.id, label: `Upsell: ${rec.upsellProduct.name}` });

		return {
			content: `## Recommendation for **${opp.name}**

**Primary Product:** ${rec.primaryProduct.name} (${rec.primaryProduct.sku})
- Unit Price: ${fmt(rec.primaryProduct.unitPrice, opp.currency)}/kg
- Family: ${rec.primaryProduct.familyName}
- Confidence: **${confidenceLabel(rec.confidenceScore)}** (${Math.round(rec.confidenceScore * 100)}%)

**Why this product?**
${rec.primaryReasoning}

**Score Breakdown:**
- Industry Fit: ${Math.round(rec.scoreBreakdown.industryFit * 100)}%
- Similar Accounts: ${Math.round(rec.scoreBreakdown.similarAccounts * 100)}%
- Account Affinity: ${Math.round(rec.scoreBreakdown.affinity * 100)}%
- Use-Case Alignment: ${Math.round(rec.scoreBreakdown.useCaseFit * 100)}%

${rec.upsellProduct ? `**Upsell Opportunity:** ${rec.upsellProduct.name}\n${rec.upsellReasoning}` : ''}

**Next Best Action:** ${rec.nextBestAction}`,
			sources
		};
	}

	return {
		content: `To get a product recommendation, please open a specific opportunity and ask me from there — or mention the opportunity name. I'll analyse the account's industry, purchase history, and deal context to suggest the best product to propose.`,
		sources: []
	};
}

async function handleWhyStuck(
	contextType?: string, contextId?: string
): Promise<CopilotResponse> {
	const sources: CopilotSource[] = [];

	if (contextType === 'opportunity' && contextId) {
		const opp = await getOpportunityById(contextId);
		if (!opp) return { content: 'Opportunity not found.', sources: [] };

		sources.push({ type: 'opportunity', id: contextId, label: opp.name });

		const issues: string[] = [];

		if (opp.stalledDays > 0) {
			issues.push(`**No movement for ${opp.stalledDays} days.** The opportunity hasn't progressed since it entered the ${opp.stageName} stage.`);
		}
		if (!opp.activities.length) {
			issues.push('**No activities logged.** There is no record of calls, emails, or meetings on this deal.');
		} else {
			const lastAct = opp.activities[0];
			const daysSince = Math.floor((Date.now() - new Date(lastAct.activityDate).getTime()) / 86400000);
			if (daysSince > 10) {
				issues.push(`**Last contact was ${daysSince} days ago** (${lastAct.type}: "${lastAct.subject}"). The buyer may have gone cold.`);
			}
		}
		if (!opp.problemStatement) {
			issues.push('**No problem statement recorded.** Without a clear pain point documented, it\'s hard to tailor the proposal.');
		}
		if (opp.riskLevel === 'high') {
			issues.push(`**Risk level is HIGH.** This deal needs immediate attention.`);
		}
		const daysToClose = Math.floor((new Date(opp.closeDate).getTime() - Date.now()) / 86400000);
		if (daysToClose < 0) {
			issues.push(`**Close date has passed** by ${Math.abs(daysToClose)} days. The forecast date needs to be updated.`);
		}

		if (!issues.length) {
			issues.push('No major stall indicators detected. The deal appears to be progressing normally.');
		}

		return {
			content: `## Why is **${opp.name}** stuck?

${issues.map((i) => `- ${i}`).join('\n')}

**Suggested Action:** ${opp.recommendation?.nextBestAction ?? 'Review the opportunity and schedule a call with the decision-maker to re-establish urgency.'}`,
			sources
		};
	}

	return {
		content: `To diagnose why a deal is stuck, ask me from within a specific opportunity page — e.g., open the opportunity and type "why is this deal stuck?". I'll analyse the activity history, stage age, and risk indicators.`,
		sources: []
	};
}

async function handleUpsellCrossSell(
	contextType?: string, contextId?: string
): Promise<CopilotResponse> {
	const sources: CopilotSource[] = [];

	if (contextType === 'opportunity' && contextId) {
		let rec = await getStoredRecommendation(contextId);
		if (!rec) rec = await generateRecommendation(contextId);

		const opp = await getOpportunityById(contextId);
		if (!rec || !opp) return { content: 'Unable to generate upsell/cross-sell suggestions.', sources: [] };

		sources.push({ type: 'opportunity', id: contextId, label: opp.name });

		const parts: string[] = [`## Upsell & Cross-Sell for **${opp.name}**\n`];

		if (rec.upsellProduct) {
			sources.push({ type: 'product', id: rec.upsellProduct.id, label: rec.upsellProduct.name });
			parts.push(`### Upsell: ${rec.upsellProduct.name}\n${rec.upsellReasoning}\n`);
		} else {
			parts.push('No clear upsell opportunity identified at this time.\n');
		}

		if (rec.crossSellProduct) {
			sources.push({ type: 'product', id: rec.crossSellProduct.id, label: rec.crossSellProduct.name });
			parts.push(`### Cross-Sell: ${rec.crossSellProduct.name}\n${rec.crossSellReasoning}\n`);
		} else {
			parts.push('No cross-sell opportunity identified based on account purchase history.\n');
		}

		return { content: parts.join('\n'), sources };
	}

	return {
		content: 'Open a specific opportunity to see upsell and cross-sell suggestions tailored to that account and deal context.',
		sources: []
	};
}

async function handlePipelineSummary(): Promise<CopilotResponse> {
	const data = await getDashboardData();
	const { stats } = data;

	return {
		content: `## Pipeline Summary

**Total Pipeline Value:** ${fmt(stats.totalPipelineValue)}
**Open Opportunities:** ${stats.openOpportunities}
**Stalled Deals:** ${stats.stalledDeals}
**Avg Deal Age:** ${stats.avgDealAge} days
**Closing This Month:** ${stats.closingThisMonth} deals (${fmt(stats.closingThisMonthValue)})
**Win Rate Estimate:** ${Math.round(stats.winRateEstimate * 100)}%

**Top Recommended Actions:**
${data.recommendedActions.slice(0, 4).map((a) => `- **[${a.urgency.toUpperCase()}]** ${a.accountName} — ${a.action}`).join('\n')}`,
		sources: []
	};
}

async function handleNextAction(
	contextType?: string, contextId?: string
): Promise<CopilotResponse> {
	if (contextType === 'opportunity' && contextId) {
		let rec = await getStoredRecommendation(contextId);
		if (!rec) rec = await generateRecommendation(contextId);

		const opp = await getOpportunityById(contextId);
		if (!opp) return { content: 'Opportunity not found.', sources: [] };

		return {
			content: `## Next Best Action for **${opp.name}**

**Recommended Action:** ${rec?.nextBestAction ?? 'Schedule a touchpoint with the customer'}

**Why:** ${rec?.actionReasoning ?? 'Based on current stage and deal age.'}

**Current Stage:** ${opp.stageName} (${Math.round(opp.stageProbability * 100)}% probability)
**Deal Age:** ${opp.ageInStageDays} days in current stage
**Risk Level:** ${opp.riskLevel.toUpperCase()}`,
			sources: [{ type: 'opportunity', id: contextId, label: opp.name }]
		};
	}

	return {
		content: 'Ask me about the next action from within a specific opportunity for tailored advice.',
		sources: []
	};
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export async function processCopilotMessage(request: CopilotRequest): Promise<CopilotResponse> {
	const intent = detectIntent(request.message);

	switch (intent) {
		case 'what_to_propose':
			return handleWhatToPropose(request.contextType, request.contextId);
		case 'why_stuck':
			return handleWhyStuck(request.contextType, request.contextId);
		case 'upsell_crosssell':
			return handleUpsellCrossSell(request.contextType, request.contextId);
		case 'pipeline_summary':
			return handlePipelineSummary();
		case 'next_action':
			return handleNextAction(request.contextType, request.contextId);
		case 'account_overview':
			if (request.contextType === 'account' && request.contextId) {
				const account = await getAccountById(request.contextId);
				if (!account) return { content: 'Account not found.', sources: [] };
				return {
					content: `## Account Overview: ${account.name}

**Industry:** ${account.industryName}
**Tier:** ${account.tier.toUpperCase()}
**Open Opportunities:** ${account.openOpportunities}
**Total Historical Purchases:** ${fmt(account.totalPurchaseValue)}
**City:** ${account.city ?? 'N/A'}, ${account.state ?? ''} ${account.country}

**Recent Purchase History:**
${account.purchaseHistory.slice(0, 3).map((h) => `- ${h.productName}: ${fmt(h.totalValue)} (${h.purchaseDate})`).join('\n')}`,
					sources: [{ type: 'account', id: account.id, label: account.name }]
				};
			}
			return { content: 'Open a specific account page and ask me for an overview.', sources: [] };

		default:
			return {
				content: `I'm your AI Sales Advisor. I can help you with:

- **What to propose** — "What should I sell to this customer?"
- **Why a deal is stuck** — "Why is this deal not moving?"
- **Upsell/cross-sell** — "What else can I sell here?"
- **Next best action** — "What should I do next on this deal?"
- **Pipeline summary** — "Give me a pipeline overview"

Ask me from within an opportunity or account page for the most relevant advice.`,
				sources: []
			};
	}
}
