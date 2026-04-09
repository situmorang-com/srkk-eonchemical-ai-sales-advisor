import { users, accounts, opportunities, opportunityStages } from '$lib/data';

export function load() {
	const teamMembers = users
		.filter((u) => u.role === 'account_executive')
		.map((u) => {
			const userOpps = opportunities.filter((o) => o.assignedUserId === u.id);
			const stalled = userOpps.filter((o) => o.isStalled);
			return {
				id: u.id,
				name: u.name,
				region: u.region,
				openOpportunities: userOpps.length,
				pipelineValue: userOpps.reduce((s, o) => s + (o.value || 0), 0),
				stalledCount: stalled.length,
				activitiesPerWeek: Math.floor(Math.random() * 8) + 3
			};
		});

	const stalledInterventions = opportunities
		.filter((o) => o.isStalled)
		.map((o) => {
			const account = accounts.find((a) => a.id === o.accountId);
			const assignedUser = users.find((u) => u.id === o.assignedUserId);
			return {
				id: o.id,
				opportunityName: o.name,
				accountName: account?.name ?? '',
				repName: assignedUser?.name ?? '',
				stalledDays: o.stalledDays,
				value: o.value,
				riskLevel: o.riskLevel
			};
		});

	const pipelineByStage = opportunityStages.map((stage) => {
		const stageOpps = opportunities.filter((o) => o.stageId === stage.id);
		return {
			stageCode: stage.code,
			stageName: stage.name,
			count: stageOpps.length,
			value: stageOpps.reduce((s, o) => s + (o.value || 0), 0)
		};
	});

	const adoptionSummary = {
		totalRecommendations: opportunities.length,
		adopted: Math.floor(opportunities.length * 0.42),
		adoptionRate: 0.42
	};

	const topAccounts = accounts.slice(0, 5).map((a) => {
		const acctOpps = opportunities.filter((o) => o.accountId === a.id);
		return {
			id: a.id,
			name: a.name,
			openOpportunities: acctOpps.length,
			pipelineValue: acctOpps.reduce((s, o) => s + (o.value || 0), 0)
		};
	});

	return {
		managerData: {
			teamMembers,
			stalledInterventions,
			pipelineByStage,
			adoptionSummary,
			topAccounts
		}
	};
}
