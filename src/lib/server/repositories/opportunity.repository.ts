import { db } from '../db';
import { opportunities, accounts, users, opportunityStages, products, industries, activities, notes, recommendations } from '../db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import type { OpportunitySummary, OpportunityDetail, ActivityItem, NoteItem } from '$lib/types';

function mapToSummary(row: {
	id: string; name: string; accountId: string; accountName: string | null;
	industryName: string | null; stageName: string | null; stageCode: string | null;
	stageProbability: number | null; stageOrder: number | null; value: number;
	currency: string; closeDate: string; isStalled: boolean; stalledDays: number;
	riskLevel: string; assignedUserName: string | null; primaryProductName: string | null;
}): OpportunitySummary {
	return {
		id:                 row.id,
		name:               row.name,
		accountId:          row.accountId,
		accountName:        row.accountName ?? '',
		industryName:       row.industryName ?? '',
		stageName:          row.stageName ?? '',
		stageCode:          row.stageCode ?? '',
		stageProbability:   row.stageProbability ?? 0,
		stageOrder:         row.stageOrder ?? 0,
		value:              row.value,
		currency:           row.currency,
		closeDate:          row.closeDate,
		isStalled:          row.isStalled,
		stalledDays:        row.stalledDays,
		riskLevel:          row.riskLevel as OpportunitySummary['riskLevel'],
		assignedUserName:   row.assignedUserName ?? null,
		daysSinceActivity:  null,
		primaryProductName: row.primaryProductName ?? null
	};
}

export async function getAllOpportunities(): Promise<OpportunitySummary[]> {
	const rows = await db
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
		.leftJoin(accounts, eq(opportunities.accountId, accounts.id))
		.leftJoin(industries, eq(accounts.industryId, industries.id))
		.leftJoin(opportunityStages, eq(opportunities.stageId, opportunityStages.id))
		.leftJoin(users, eq(opportunities.assignedUserId, users.id))
		.leftJoin(products, eq(opportunities.primaryProductId, products.id))
		.orderBy(desc(opportunities.value));

	return rows.map(mapToSummary);
}

export async function getPriorityOpportunities(limit = 8): Promise<OpportunitySummary[]> {
	const rows = await db
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
		.leftJoin(accounts, eq(opportunities.accountId, accounts.id))
		.leftJoin(industries, eq(accounts.industryId, industries.id))
		.leftJoin(opportunityStages, eq(opportunities.stageId, opportunityStages.id))
		.leftJoin(users, eq(opportunities.assignedUserId, users.id))
		.leftJoin(products, eq(opportunities.primaryProductId, products.id))
		.orderBy(desc(opportunities.value))
		.limit(limit);

	return rows.map(mapToSummary);
}

export async function getStalledOpportunities(): Promise<OpportunitySummary[]> {
	const rows = await db
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
		.leftJoin(accounts, eq(opportunities.accountId, accounts.id))
		.leftJoin(industries, eq(accounts.industryId, industries.id))
		.leftJoin(opportunityStages, eq(opportunities.stageId, opportunityStages.id))
		.leftJoin(users, eq(opportunities.assignedUserId, users.id))
		.leftJoin(products, eq(opportunities.primaryProductId, products.id))
		.where(eq(opportunities.isStalled, true))
		.orderBy(desc(opportunities.stalledDays));

	return rows.map(mapToSummary);
}

export async function getOpportunityById(id: string): Promise<OpportunityDetail | null> {
	const [row] = await db
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
			assignedUserId:   opportunities.assignedUserId,
			assignedUserName: users.name,
			primaryProductId: opportunities.primaryProductId,
			primaryProductName: products.name,
			problemStatement: opportunities.problemStatement,
			useCase:          opportunities.useCase,
			competitorNotes:  opportunities.competitorNotes,
			createdAt:        opportunities.createdAt
		})
		.from(opportunities)
		.leftJoin(accounts, eq(opportunities.accountId, accounts.id))
		.leftJoin(industries, eq(accounts.industryId, industries.id))
		.leftJoin(opportunityStages, eq(opportunities.stageId, opportunityStages.id))
		.leftJoin(users, eq(opportunities.assignedUserId, users.id))
		.leftJoin(products, eq(opportunities.primaryProductId, products.id))
		.where(eq(opportunities.id, id));

	if (!row) return null;

	// Age in stage = days since created (simplified)
	const createdDate = new Date(row.createdAt);
	const now = new Date();
	const ageInStageDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

	const oppActivities = await db
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
		.where(eq(activities.opportunityId, id))
		.orderBy(desc(activities.activityDate));

	const oppNotes = await db
		.select({
			id:        notes.id,
			content:   notes.content,
			isPinned:  notes.isPinned,
			createdAt: notes.createdAt,
			userName:  users.name
		})
		.from(notes)
		.leftJoin(users, eq(notes.userId, users.id))
		.where(eq(notes.opportunityId, id))
		.orderBy(desc(notes.isPinned), desc(notes.createdAt));

	return {
		id:                 row.id,
		name:               row.name,
		accountId:          row.accountId,
		accountName:        row.accountName ?? '',
		industryName:       row.industryName ?? '',
		stageName:          row.stageName ?? '',
		stageCode:          row.stageCode ?? '',
		stageProbability:   row.stageProbability ?? 0,
		stageOrder:         row.stageOrder ?? 0,
		value:              row.value,
		currency:           row.currency,
		closeDate:          row.closeDate,
		isStalled:          row.isStalled,
		stalledDays:        row.stalledDays,
		riskLevel:          row.riskLevel as OpportunityDetail['riskLevel'],
		assignedUserId:     row.assignedUserId ?? null,
		assignedUserName:   row.assignedUserName ?? null,
		primaryProductId:   row.primaryProductId ?? null,
		primaryProductName: row.primaryProductName ?? null,
		problemStatement:   row.problemStatement,
		useCase:            row.useCase,
		competitorNotes:    row.competitorNotes,
		ageInStageDays,
		daysSinceActivity:  oppActivities.length > 0
			? Math.floor((now.getTime() - new Date(oppActivities[0].activityDate).getTime()) / (1000 * 60 * 60 * 24))
			: null,
		activities: oppActivities.map((a) => ({
			id:              a.id,
			type:            a.type as ActivityItem['type'],
			subject:         a.subject,
			description:     a.description,
			outcome:         a.outcome,
			activityDate:    a.activityDate,
			durationMinutes: a.durationMinutes,
			userName:        a.userName ?? null
		}) satisfies ActivityItem),
		notes: oppNotes.map((n) => ({
			id:        n.id,
			content:   n.content,
			isPinned:  n.isPinned,
			createdAt: n.createdAt,
			userName:  n.userName ?? null
		}) satisfies NoteItem),
		recommendation: null   // filled by recommendation service
	};
}

export async function getOpportunitiesByUserId(userId: string): Promise<OpportunitySummary[]> {
	const rows = await db
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
		.leftJoin(accounts, eq(opportunities.accountId, accounts.id))
		.leftJoin(industries, eq(accounts.industryId, industries.id))
		.leftJoin(opportunityStages, eq(opportunities.stageId, opportunityStages.id))
		.leftJoin(users, eq(opportunities.assignedUserId, users.id))
		.leftJoin(products, eq(opportunities.primaryProductId, products.id))
		.where(eq(opportunities.assignedUserId, userId))
		.orderBy(desc(opportunities.value));

	return rows.map(mapToSummary);
}
