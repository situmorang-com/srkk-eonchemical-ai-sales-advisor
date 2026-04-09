import { db } from '../db';
import { accounts, users, industries, accountProductHistory, products, productFamilies, opportunities, opportunityStages, activities, notes } from '../db/schema';
import { eq, sql, desc, and, ne } from 'drizzle-orm';
import type { AccountSummary, AccountDetail, PurchaseHistoryItem, ActivityItem, NoteItem, OpportunitySummary } from '$lib/types';

export async function getAllAccounts(): Promise<AccountSummary[]> {
	const rows = await db
		.select({
			id:               accounts.id,
			name:             accounts.name,
			industryId:       accounts.industryId,
			industryName:     industries.name,
			status:           accounts.status,
			tier:             accounts.tier,
			city:             accounts.city,
			state:            accounts.state,
			country:          accounts.country,
			assignedUserName: users.name
		})
		.from(accounts)
		.leftJoin(industries, eq(accounts.industryId, industries.id))
		.leftJoin(users, eq(accounts.assignedUserId, users.id))
		.orderBy(accounts.name);

	const accountIds = rows.map((r) => r.id);

	// Fetch open opportunity counts per account
	const oppCounts = await db
		.select({
			accountId: opportunities.accountId,
			count:     sql<number>`count(*)`.as('count')
		})
		.from(opportunities)
		.groupBy(opportunities.accountId);

	const oppCountMap = new Map(oppCounts.map((o) => [o.accountId, o.count]));

	// Fetch total purchase value per account
	const purchaseValues = await db
		.select({
			accountId:   accountProductHistory.accountId,
			totalValue:  sql<number>`sum(total_value)`.as('total_value')
		})
		.from(accountProductHistory)
		.groupBy(accountProductHistory.accountId);

	const purchaseMap = new Map(purchaseValues.map((p) => [p.accountId, p.totalValue]));

	return rows.map((row) => ({
		id:                  row.id,
		name:                row.name,
		industryId:          row.industryId,
		industryName:        row.industryName ?? 'Unknown',
		status:              row.status as AccountSummary['status'],
		tier:                row.tier as AccountSummary['tier'],
		city:                row.city,
		state:               row.state,
		country:             row.country,
		assignedUserName:    row.assignedUserName ?? null,
		openOpportunities:   oppCountMap.get(row.id) ?? 0,
		totalPurchaseValue:  purchaseMap.get(row.id) ?? 0
	}));
}

export async function getAccountById(id: string): Promise<AccountDetail | null> {
	const [row] = await db
		.select({
			id:              accounts.id,
			name:            accounts.name,
			industryId:      accounts.industryId,
			industryName:    industries.name,
			status:          accounts.status,
			tier:            accounts.tier,
			city:            accounts.city,
			state:           accounts.state,
			country:         accounts.country,
			assignedUserId:  accounts.assignedUserId,
			assignedUserName: users.name,
			website:         accounts.website,
			annualRevenue:   accounts.annualRevenue,
			employeeCount:   accounts.employeeCount,
			tags:            accounts.tags
		})
		.from(accounts)
		.leftJoin(industries, eq(accounts.industryId, industries.id))
		.leftJoin(users, eq(accounts.assignedUserId, users.id))
		.where(eq(accounts.id, id));

	if (!row) return null;

	// Purchase history
	const history = await db
		.select({
			id:          accountProductHistory.id,
			productId:   accountProductHistory.productId,
			productName: products.name,
			productSku:  products.sku,
			familyName:  productFamilies.name,
			volumeKg:    accountProductHistory.volumeKg,
			totalValue:  accountProductHistory.totalValue,
			purchaseDate: accountProductHistory.purchaseDate,
			isRecurring: accountProductHistory.isRecurring
		})
		.from(accountProductHistory)
		.leftJoin(products, eq(accountProductHistory.productId, products.id))
		.leftJoin(productFamilies, eq(products.familyId, productFamilies.id))
		.where(eq(accountProductHistory.accountId, id))
		.orderBy(desc(accountProductHistory.purchaseDate));

	// Open opportunities
	const opps = await db
		.select({
			id:               opportunities.id,
			name:             opportunities.name,
			accountId:        opportunities.accountId,
			accountName:      accounts.name,
			industryName:     industries.name,
			stageName:        opportunityStages.name,
			stageCode:        opportunityStages.code,
			stageProbability: opportunityStages.probability,
			stageOrder:       opportunityStages.order,
			value:            opportunities.value,
			currency:         opportunities.currency,
			closeDate:        opportunities.closeDate,
			isStalled:        opportunities.isStalled,
			stalledDays:      opportunities.stalledDays,
			riskLevel:        opportunities.riskLevel,
			assignedUserName: users.name,
			primaryProductName: products.name
		})
		.from(opportunities)
		.leftJoin(opportunityStages, eq(opportunities.stageId, opportunityStages.id))
		.leftJoin(users, eq(opportunities.assignedUserId, users.id))
		.leftJoin(products, eq(opportunities.primaryProductId, products.id))
		.leftJoin(accounts, eq(opportunities.accountId, accounts.id))
		.leftJoin(industries, eq(accounts.industryId, industries.id))
		.where(eq(opportunities.accountId, id));

	// Recent activities
	const recentActs = await db
		.select({
			id:              activities.id,
			type:            activities.type,
			subject:         activities.subject,
			description:     activities.description,
			outcome:         activities.outcome,
			activityDate:    activities.activityDate,
			durationMinutes: activities.durationMinutes,
			userName:        users.name
		})
		.from(activities)
		.leftJoin(users, eq(activities.userId, users.id))
		.where(eq(activities.accountId, id))
		.orderBy(desc(activities.activityDate))
		.limit(10);

	// Notes
	const accountNotes = await db
		.select({
			id:        notes.id,
			content:   notes.content,
			isPinned:  notes.isPinned,
			createdAt: notes.createdAt,
			userName:  users.name
		})
		.from(notes)
		.leftJoin(users, eq(notes.userId, users.id))
		.where(eq(notes.accountId, id))
		.orderBy(desc(notes.isPinned), desc(notes.createdAt));

	// Similar accounts (same industry, different account)
	const similar = await db
		.select({
			id:              accounts.id,
			name:            accounts.name,
			industryId:      accounts.industryId,
			industryName:    industries.name,
			status:          accounts.status,
			tier:            accounts.tier,
			city:            accounts.city,
			state:           accounts.state,
			country:         accounts.country,
			assignedUserName: users.name
		})
		.from(accounts)
		.leftJoin(industries, eq(accounts.industryId, industries.id))
		.leftJoin(users, eq(accounts.assignedUserId, users.id))
		.where(and(eq(accounts.industryId, row.industryId), ne(accounts.id, id)))
		.limit(5);

	const purchaseMap = new Map(
		(await db.select({ accountId: accountProductHistory.accountId, totalValue: sql<number>`sum(total_value)` })
			.from(accountProductHistory)
			.groupBy(accountProductHistory.accountId)).map((p) => [p.accountId, p.totalValue])
	);

	const totalPurchaseValue = history.reduce((sum, h) => sum + h.totalValue, 0);

	return {
		id:                  row.id,
		name:                row.name,
		industryId:          row.industryId,
		industryName:        row.industryName ?? 'Unknown',
		status:              row.status as AccountDetail['status'],
		tier:                row.tier as AccountDetail['tier'],
		city:                row.city,
		state:               row.state,
		country:             row.country,
		assignedUserId:      row.assignedUserId ?? null,
		assignedUserName:    row.assignedUserName ?? null,
		website:             row.website,
		annualRevenue:       row.annualRevenue,
		employeeCount:       row.employeeCount,
		tags:                JSON.parse(row.tags ?? '[]'),
		openOpportunities:   opps.length,
		totalPurchaseValue,
		purchaseHistory:     history.map((h) => ({
			id:          h.id,
			productId:   h.productId,
			productName: h.productName ?? 'Unknown',
			productSku:  h.productSku ?? '',
			familyName:  h.familyName ?? 'Unknown',
			volumeKg:    h.volumeKg,
			totalValue:  h.totalValue,
			purchaseDate: h.purchaseDate,
			isRecurring: h.isRecurring
		}) satisfies PurchaseHistoryItem),
		openOpportunityList: opps.map((o) => ({
			id:                o.id,
			name:              o.name,
			accountId:         o.accountId,
			accountName:       o.accountName ?? '',
			industryName:      o.industryName ?? '',
			stageName:         o.stageName ?? '',
			stageCode:         o.stageCode ?? '',
			stageProbability:  o.stageProbability ?? 0,
			stageOrder:        o.stageOrder ?? 0,
			value:             o.value,
			currency:          o.currency,
			closeDate:         o.closeDate,
			isStalled:         o.isStalled,
			stalledDays:       o.stalledDays,
			riskLevel:         o.riskLevel as OpportunitySummary['riskLevel'],
			assignedUserName:  o.assignedUserName ?? null,
			daysSinceActivity: null,
			primaryProductName: o.primaryProductName ?? null
		}) satisfies OpportunitySummary),
		recentActivities: recentActs.map((a) => ({
			id:              a.id,
			type:            a.type as ActivityItem['type'],
			subject:         a.subject,
			description:     a.description,
			outcome:         a.outcome,
			activityDate:    a.activityDate,
			durationMinutes: a.durationMinutes,
			userName:        a.userName ?? null
		}) satisfies ActivityItem),
		notes: accountNotes.map((n) => ({
			id:        n.id,
			content:   n.content,
			isPinned:  n.isPinned,
			createdAt: n.createdAt,
			userName:  n.userName ?? null
		}) satisfies NoteItem),
		similarAccounts: similar.map((s) => ({
			id:                s.id,
			name:              s.name,
			industryId:        s.industryId,
			industryName:      s.industryName ?? 'Unknown',
			status:            s.status as AccountSummary['status'],
			tier:              s.tier as AccountSummary['tier'],
			city:              s.city,
			state:             s.state,
			country:           s.country,
			assignedUserName:  s.assignedUserName ?? null,
			openOpportunities: 0,
			totalPurchaseValue: purchaseMap.get(s.id) ?? 0
		}) satisfies AccountSummary)
	};
}
