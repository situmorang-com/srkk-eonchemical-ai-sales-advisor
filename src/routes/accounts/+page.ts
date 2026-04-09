import { accounts, industries, users, opportunities } from '$lib/data';

export function load() {
	return {
		accounts: accounts.map((a) => ({
			id: a.id,
			name: a.name,
			industryId: a.industryId,
			industryName: industries.find((i) => i.id === a.industryId)?.name ?? '',
			status: a.status,
			tier: a.tier,
			city: a.city ?? null,
			state: a.state ?? null,
			country: a.country,
			assignedUserName: users.find((u) => u.id === a.assignedUserId)?.name ?? null,
			openOpportunities: opportunities.filter((o) => o.accountId === a.id).length,
			totalPurchaseValue: 0
		}))
	};
}
