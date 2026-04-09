import {
	accountProductHistory,
	accounts,
	activities,
	industries,
	notes,
	opportunities,
	opportunityStages,
	productFamilies,
	productIndustryFit,
	products,
	users
} from '$lib/data';
import { error } from '@sveltejs/kit';

const stageProbabilityByCode: Record<string, number> = {
	PROSPECT: 0.15,
	QUAL: 0.35,
	PROPOSAL: 0.6,
	NEGOTIATION: 0.8,
	WON: 1
};

function daysSince(dateString: string) {
	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return null;
	return Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000));
}

export function load({ params }: { params: { id: string } }) {
	const opportunity = opportunities.find((item) => item.id === params.id);
	if (!opportunity) throw error(404, 'Opportunity not found');

	const account = accounts.find((item) => item.id === opportunity.accountId);
	if (!account) throw error(404, 'Account not found');

	const industry = industries.find((item) => item.id === account.industryId);
	const stage = opportunityStages.find((item) => item.id === opportunity.stageId);
	const assignedUser = users.find((item) => item.id === opportunity.assignedUserId);
	const product = products.find((item) => item.id === opportunity.primaryProductId);
	const productFamily = product ? productFamilies.find((item) => item.id === product.familyId) : null;
	const industryFit = product && industry
		? productIndustryFit.find((item) => item.productId === product.id && item.industryId === industry.id)
		: null;

	const opportunityActivities = activities
		.filter((item) => item.opportunityId === opportunity.id)
		.sort((a, b) => b.activityDate.localeCompare(a.activityDate));
	const opportunityNotes = notes.filter((item) => item.opportunityId === opportunity.id);
	const accountHistory = accountProductHistory.filter((item) => item.accountId === account.id);
	const latestActivityDate = opportunityActivities[0]?.activityDate ?? null;
	const daysSinceActivity = latestActivityDate ? daysSince(latestActivityDate) : null;
	const similarAccountCount = accounts.filter(
		(item) => item.id !== account.id && item.industryId === account.industryId
	).length;
	const hasFamilyHistory = productFamily
		? accountHistory.some((item) => products.find((productItem) => productItem.id === item.productId)?.familyId === productFamily.id)
		: false;

	const recommendation = product && productFamily
		? {
			id: `rec-${opportunity.id}`,
			primaryProduct: {
				id: product.id,
				name: product.name,
				sku: product.sku,
				familyName: productFamily.name,
				unitPrice: product.pricePerKg,
				uom: 'kg',
				primaryUseCase: industryFit?.commonUseCase ?? opportunity.useCase ?? null
			},
			upsellProduct: null,
			crossSellProduct: null,
			confidenceScore: Math.min(
				0.97,
				(industryFit?.fitScore ?? 75) / 100 * 0.5 +
					(hasFamilyHistory ? 0.2 : 0.1) +
					Math.min(similarAccountCount, 3) * 0.08 +
					(opportunity.useCase ? 0.1 : 0.04)
			),
			scoreBreakdown: {
				industryFit: Math.min(1, (industryFit?.fitScore ?? 75) / 100),
				similarAccounts: Math.min(1, 0.45 + similarAccountCount * 0.12),
				affinity: hasFamilyHistory ? 0.82 : 0.56,
				useCaseFit: opportunity.useCase ? 0.8 : 0.55
			},
			primaryReasoning: `${product.name} matches ${account.name}'s ${industry?.name ?? 'target'} use case and addresses the stated problem: ${opportunity.problemStatement ?? 'no problem statement recorded yet'}.`,
			upsellReasoning: null,
			crossSellReasoning: null,
			nextBestAction:
				stage?.code === 'PROPOSAL'
					? 'Send the formal proposal with scope breakdown and lock a technical review meeting this week.'
					: stage?.code === 'NEGOTIATION'
						? 'Resolve pricing objections and confirm the commercial close plan with the decision maker.'
						: stage?.code === 'QUAL'
							? 'Validate technical requirements and confirm evaluation criteria before advancing.'
							: 'Reconfirm the operational problem, success criteria, and buying timeline.',
			actionReasoning:
				stage?.code === 'PROPOSAL'
					? 'The deal is already in proposal stage, so momentum now depends on converting technical interest into a scoped commercial conversation.'
					: 'The next step should reduce uncertainty and move the opportunity forward with a concrete buyer commitment.',
			isAdopted: null,
			generatedAt: new Date().toISOString()
		}
		: null;

	return {
		opp: {
			id: opportunity.id,
			name: opportunity.name,
			accountId: opportunity.accountId,
			accountName: account.name,
			industryName: industry?.name ?? '',
			stageName: stage?.name ?? '',
			stageCode: stage?.code ?? '',
			stageProbability: stageProbabilityByCode[stage?.code ?? ''] ?? 0,
			stageOrder: stage?.sequence ?? 0,
			value: opportunity.value,
			currency: opportunity.currency,
			closeDate: opportunity.closeDate,
			isStalled: opportunity.isStalled,
			stalledDays: opportunity.stalledDays,
			riskLevel: opportunity.riskLevel,
			assignedUserName: assignedUser?.name ?? null,
			daysSinceActivity,
			primaryProductName: product?.name ?? null,
			assignedUserId: opportunity.assignedUserId,
			primaryProductId: opportunity.primaryProductId,
			problemStatement: opportunity.problemStatement ?? null,
			useCase: opportunity.useCase ?? null,
			competitorNotes: opportunity.competitorNotes ?? null,
			ageInStageDays: Math.max(opportunity.stalledDays ?? 0, daysSinceActivity ?? 0),
			activities: opportunityActivities.map((item) => ({
				id: item.id,
				type: item.type,
				subject: item.subject,
				description: item.description ?? null,
				outcome: item.outcome ?? null,
				activityDate: item.activityDate,
				durationMinutes: item.durationMinutes ?? null,
				userName: users.find((user) => user.id === item.userId)?.name ?? null
			})),
			notes: opportunityNotes.map((item) => ({
				id: item.id,
				content: item.content,
				isPinned: item.isPinned ?? false,
				createdAt: item.createdAt ?? '',
				userName: users.find((user) => user.id === item.userId)?.name ?? null
			})),
			recommendation
		}
	};
}
