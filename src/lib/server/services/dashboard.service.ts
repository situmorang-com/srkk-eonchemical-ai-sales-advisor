import { db } from '../db';
import { opportunities, accounts, users, opportunityStages, activities, recommendations, products, industries } from '../db/schema';
import { eq, desc, sql, and, count } from 'drizzle-orm';
import { getPriorityOpportunities, getStalledOpportunities } from '../repositories/opportunity.repository';
import type { DashboardData, DashboardStats, RecommendedAction, ManagerDashboardData, TeamMemberSummary, StalledIntervention, PipelineStageBreakdown, AdoptionSummary } from '$lib/types';

export async function getDashboardData(): Promise<DashboardData> {
	const [priorityOpportunities, stalledDeals] = await Promise.all([
		getPriorityOpportunities(8),
		getStalledOpportunities()
	]);

	// Pipeline stats
	const [statsRow] = await db
		.select({
			totalValue:   sql<number>`sum(value)`.as('total_value'),
			openCount:    sql<number>`count(*)`.as('open_count'),
			stalledCount: sql<number>`sum(case when is_stalled = 1 then 1 else 0 end)`.as('stalled_count'),
			avgAge:       sql<number>`avg(julianday('now') - julianday(created_at))`.as('avg_age')
		})
		.from(opportunities);

	const now = new Date();
	const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

	const [closingRow] = await db
		.select({
			count: sql<number>`count(*)`.as('count'),
			value: sql<number>`sum(value)`.as('value')
		})
		.from(opportunities)
		.where(sql`close_date between ${startOfMonth} and ${endOfMonth}`);

	const stats: DashboardStats = {
		totalPipelineValue:      statsRow?.totalValue ?? 0,
		openOpportunities:       statsRow?.openCount ?? 0,
		stalledDeals:            statsRow?.stalledCount ?? 0,
		avgDealAge:              Math.round(statsRow?.avgAge ?? 0),
		closingThisMonth:        closingRow?.count ?? 0,
		closingThisMonthValue:   closingRow?.value ?? 0,
		winRateEstimate:         0.32   // seeded constant for MVP
	};

	// Recommended actions from stalled + high-risk opps
	const recommendedActions: RecommendedAction[] = stalledDeals.slice(0, 5).map((opp) => ({
		opportunityId: opp.id,
		opportunityName: opp.name,
		accountName: opp.accountName,
		action: opp.stalledDays > 21
			? 'Schedule executive re-engagement'
			: 'Send follow-up with technical data sheet',
		urgency: opp.riskLevel === 'high' ? 'high' : opp.stalledDays > 14 ? 'medium' : 'low',
		reason: `Stalled for ${opp.stalledDays} days in ${opp.stageName} stage`
	}));

	// Add closing-soon actions
	const closingSoon = priorityOpportunities
		.filter((o) => {
			const daysToClose = Math.floor(
				(new Date(o.closeDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
			);
			return daysToClose <= 14 && daysToClose >= 0;
		})
		.slice(0, 3);

	for (const opp of closingSoon) {
		if (!recommendedActions.find((a) => a.opportunityId === opp.id)) {
			recommendedActions.push({
				opportunityId:   opp.id,
				opportunityName: opp.name,
				accountName:     opp.accountName,
				action:          'Confirm close date and finalize proposal',
				urgency:         'high',
				reason:          `Closing date in ${Math.floor((new Date(opp.closeDate).getTime() - Date.now()) / 86400000)} days`
			});
		}
	}

	// Pipeline by stage (for dashboard chart)
	const dashboardStageBreakdown = await db
		.select({
			stageName:  opportunityStages.name,
			stageCode:  opportunityStages.code,
			count:      sql<number>`count(opportunities.id)`,
			totalValue: sql<number>`coalesce(sum(opportunities.value), 0)`,
			avgAge:     sql<number>`avg(julianday('now') - julianday(opportunities.created_at))`
		})
		.from(opportunityStages)
		.leftJoin(opportunities, eq(opportunities.stageId, opportunityStages.id))
		.groupBy(opportunityStages.id)
		.orderBy(opportunityStages.order);

	const pipelineByStage: PipelineStageBreakdown[] = dashboardStageBreakdown.map((s) => ({
		stageName:  s.stageName,
		stageCode:  s.stageCode,
		count:      s.count ?? 0,
		totalValue: s.totalValue ?? 0,
		avgAge:     Math.round(s.avgAge ?? 0)
	}));

	return {
		priorityOpportunities,
		stalledDeals,
		recommendedActions: recommendedActions.slice(0, 8),
		stats,
		pipelineByStage
	};
}

export async function getManagerDashboardData(): Promise<ManagerDashboardData> {
	// Team member summaries
	const teamUsers = await db
		.select({ id: users.id, name: users.name })
		.from(users)
		.where(eq(users.role, 'sales_rep'));

	const teamMembers: TeamMemberSummary[] = await Promise.all(
		teamUsers.map(async (u) => {
			const [oppStats] = await db
				.select({
					count: sql<number>`count(*)`,
					value: sql<number>`sum(value)`,
					stalled: sql<number>`sum(case when is_stalled = 1 then 1 else 0 end)`
				})
				.from(opportunities)
				.where(eq(opportunities.assignedUserId, u.id));

			const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
			const [actCount] = await db
				.select({ count: sql<number>`count(*)` })
				.from(activities)
				.where(and(eq(activities.userId, u.id), sql`activity_date >= ${weekAgo}`));

			return {
				userId:              u.id,
				name:                u.name,
				openOpportunities:   oppStats?.count ?? 0,
				pipelineValue:       oppStats?.value ?? 0,
				stalledDeals:        oppStats?.stalled ?? 0,
				activitiesThisWeek:  actCount?.count ?? 0
			};
		})
	);

	// Stalled interventions
	const stalledOpps = await getStalledOpportunities();
	const stalledInterventions: StalledIntervention[] = stalledOpps.slice(0, 10).map((opp) => ({
		opportunityId:   opp.id,
		opportunityName: opp.name,
		accountName:     opp.accountName,
		assignedTo:      opp.assignedUserName ?? 'Unassigned',
		stalledDays:     opp.stalledDays,
		lastActivity:    null,
		suggestedAction: opp.stalledDays > 21
			? 'Escalate to manager — schedule executive call'
			: 'Send re-engagement email with product data sheet',
		riskLevel: opp.riskLevel
	}));

	// Pipeline by stage
	const stageBreakdown = await db
		.select({
			stageName:  opportunityStages.name,
			stageCode:  opportunityStages.code,
			count:      sql<number>`count(opportunities.id)`,
			totalValue: sql<number>`coalesce(sum(opportunities.value), 0)`,
			avgAge:     sql<number>`avg(julianday('now') - julianday(opportunities.created_at))`
		})
		.from(opportunityStages)
		.leftJoin(opportunities, eq(opportunities.stageId, opportunityStages.id))
		.groupBy(opportunityStages.id)
		.orderBy(opportunityStages.order);

	const pipelineByStage: PipelineStageBreakdown[] = stageBreakdown.map((s) => ({
		stageName:  s.stageName,
		stageCode:  s.stageCode,
		count:      s.count ?? 0,
		totalValue: s.totalValue ?? 0,
		avgAge:     Math.round(s.avgAge ?? 0)
	}));

	// Recommendation adoption
	const [adoptionRow] = await db
		.select({
			total:   sql<number>`count(*)`,
			adopted: sql<number>`sum(case when is_adopted = 1 then 1 else 0 end)`
		})
		.from(recommendations);

	const adoptionSummary: AdoptionSummary = {
		totalRecommendations: adoptionRow?.total ?? 0,
		adopted:              adoptionRow?.adopted ?? 0,
		adoptionRate:         adoptionRow?.total
			? Math.round((adoptionRow.adopted / adoptionRow.total) * 100) / 100
			: 0
	};

	// Top accounts by pipeline
	const topAccountRows = await db
		.select({
			accountId: opportunities.accountId,
			value:     sql<number>`sum(opportunities.value)`
		})
		.from(opportunities)
		.groupBy(opportunities.accountId)
		.orderBy(desc(sql`sum(opportunities.value)`))
		.limit(5);

	const topAccountIds = topAccountRows.map((r) => r.accountId);
	const { getAllAccounts } = await import('../repositories/account.repository');
	const allAccounts = await getAllAccounts();
	const topAccounts = topAccountIds
		.map((id) => allAccounts.find((a) => a.id === id))
		.filter(Boolean) as typeof allAccounts;

	return {
		teamMembers,
		stalledInterventions,
		pipelineByStage,
		adoptionSummary,
		topAccounts
	};
}
