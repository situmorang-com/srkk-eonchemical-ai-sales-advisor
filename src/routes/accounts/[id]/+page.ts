import { accounts, industries, users, opportunities, opportunityStages, products, productFamilies, notes, activities, accountProductHistory } from '$lib/data';
import { error } from '@sveltejs/kit';

const stageProbabilityByCode: Record<string, number> = {
	PROSPECT: 0.15,
	QUAL: 0.35,
	PROPOSAL: 0.6,
	NEGOTIATION: 0.8,
	WON: 1
};

export function load({ params }: { params: { id: string } }) {
	const account = accounts.find((a) => a.id === params.id);
	if (!account) throw error(404, 'Account not found');

	const industry = industries.find((i) => i.id === account.industryId);
	const assignedUser = users.find((u) => u.id === account.assignedUserId);
	const acctOpps = opportunities.filter((o) => o.accountId === account.id);
	const acctNotes = notes.filter((n) => n.accountId === account.id);
	const acctActivities = activities.filter((a) => a.accountId === account.id);
	const acctHistory = accountProductHistory.filter((h) => h.accountId === account.id);

	const openOpportunityList = acctOpps.map((o) => {
		const stage = opportunityStages.find((s) => s.id === o.stageId);
		const user = users.find((u) => u.id === o.assignedUserId);
		const product = products.find((p) => p.id === o.primaryProductId);
		return {
			id: o.id,
			name: o.name,
			accountId: o.accountId,
			accountName: account.name,
			industryName: industry?.name ?? '',
			stageName: stage?.name ?? '',
			stageCode: stage?.code ?? '',
			stageProbability: stageProbabilityByCode[stage?.code ?? ''] ?? 0,
			stageOrder: stage?.sequence ?? 0,
			value: o.value,
			currency: o.currency,
			closeDate: o.closeDate,
			isStalled: o.isStalled,
			stalledDays: o.stalledDays,
			riskLevel: o.riskLevel,
			assignedUserName: user?.name ?? null,
			daysSinceActivity: null,
			primaryProductName: product?.name ?? null
		};
	});

	const purchaseHistory = acctHistory.map((h) => {
		const product = products.find((p) => p.id === h.productId);
		const family = product ? productFamilies.find((f) => f.id === product.familyId) : null;
		return {
			id: h.id,
			productId: h.productId,
			productName: product?.name ?? 'Unknown',
			productSku: product?.sku ?? '',
			familyName: family?.name ?? '',
			volumeKg: h.volumeKg ?? 0,
			totalValue: h.totalValue ?? 0,
			purchaseDate: h.purchaseDate ?? '',
			isRecurring: h.isRecurring ?? false
		};
	});

	const recentActivities = acctActivities.map((a) => ({
		id: a.id,
		type: a.type,
		subject: a.subject,
		description: a.description ?? null,
		outcome: a.outcome ?? null,
		activityDate: a.activityDate,
		durationMinutes: a.durationMinutes ?? null,
		userName: users.find((u) => u.id === a.userId)?.name ?? null
	}));

	const similarAccounts = accounts
		.filter((a) => a.id !== account.id && a.industryId === account.industryId)
		.slice(0, 5)
		.map((a) => ({
			id: a.id,
			name: a.name,
			industryId: a.industryId,
			industryName: industry?.name ?? '',
			status: a.status,
			tier: a.tier,
			city: a.city ?? null,
			state: a.state ?? null,
			country: a.country,
			assignedUserName: users.find((u) => u.id === a.assignedUserId)?.name ?? null,
			openOpportunities: opportunities.filter((o) => o.accountId === a.id).length,
			totalPurchaseValue: 0
		}));

	let tags: string[] = [];
	try { tags = JSON.parse(account.tags as string); } catch { tags = []; }

	return {
		account: {
			id: account.id,
			name: account.name,
			industryId: account.industryId,
			industryName: industry?.name ?? '',
			status: account.status,
			tier: account.tier,
			city: account.city ?? null,
			state: account.state ?? null,
			country: account.country,
			assignedUserId: account.assignedUserId,
			assignedUserName: assignedUser?.name ?? null,
			website: account.website ?? null,
			annualRevenue: account.annualRevenue ?? null,
			employeeCount: account.employeeCount ?? null,
			tags,
			openOpportunities: acctOpps.length,
			totalPurchaseValue: purchaseHistory.reduce((s, h) => s + h.totalValue, 0),
			purchaseHistory,
			recentActivities,
			openOpportunityList,
			notes: acctNotes.map((n) => ({
				id: n.id,
				content: n.content,
				isPinned: n.isPinned ?? false,
				createdAt: n.createdAt ?? '',
				userName: users.find((u) => u.id === n.userId)?.name ?? null
			})),
			similarAccounts
		}
	};
}
