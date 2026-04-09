import { opportunities, accounts, industries, opportunityStages, users, products } from '$lib/data';

export function load() {
	return {
		opportunities: opportunities.map((o) => {
			const account = accounts.find((a) => a.id === o.accountId);
			const industry = account ? industries.find((i) => i.id === account.industryId) : null;
			const stage = opportunityStages.find((s) => s.id === o.stageId);
			const assignedUser = users.find((u) => u.id === o.assignedUserId);
			const product = products.find((p) => p.id === o.primaryProductId);

			return {
				id: o.id,
				name: o.name,
				accountId: o.accountId,
				accountName: account?.name ?? '',
				industryName: industry?.name ?? '',
				stageName: stage?.name ?? '',
				stageCode: stage?.code ?? '',
				stageProbability: 0,
				stageOrder: stage?.sequence ?? 0,
				value: o.value,
				currency: o.currency,
				closeDate: o.closeDate,
				isStalled: o.isStalled,
				stalledDays: o.stalledDays,
				riskLevel: o.riskLevel,
				assignedUserName: assignedUser?.name ?? null,
				daysSinceActivity: null,
				primaryProductName: product?.name ?? null
			};
		})
	};
}
