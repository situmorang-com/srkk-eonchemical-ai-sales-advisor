import { users, accounts, industries, opportunities, opportunityStages } from '$lib/data';

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
				stalledDeals: stalled.length,
				activitiesThisWeek: Math.floor(Math.random() * 8) + 3
			};
		});

	const stalledInterventions = opportunities
		.filter((o) => o.isStalled)
		.map((o) => {
			const account = accounts.find((a) => a.id === o.accountId);
			const assignedUser = users.find((u) => u.id === o.assignedUserId);
			const stage = opportunityStages.find((s) => s.id === o.stageId);
			return {
				id: o.id,
				opportunityId: o.id,
				opportunityName: o.name,
				accountName: account?.name ?? '',
				assignedTo: assignedUser?.name ?? '',
				stalledDays: o.stalledDays,
				value: o.value,
				riskLevel: o.riskLevel,
				suggestedAction: stage?.code === 'PROPOSAL'
					? 'Follow up on proposal — schedule a review meeting this week.'
					: stage?.code === 'NEGOTIATION'
						? 'Escalate pricing discussion and confirm decision timeline.'
						: 'Re-engage the stakeholder with a new value proposition or site visit.'
			};
		});

	const pipelineByStage = opportunityStages.map((stage) => {
		const stageOpps = opportunities.filter((o) => o.stageId === stage.id);
		return {
			stageCode: stage.code,
			stageName: stage.name,
			count: stageOpps.length,
			totalValue: stageOpps.reduce((s, o) => s + (o.value || 0), 0)
		};
	});

	const adoptionSummary = {
		totalRecommendations: opportunities.length,
		adopted: Math.floor(opportunities.length * 0.42),
		adoptionRate: 0.42
	};

	const topAccounts = accounts.slice(0, 5).map((a) => {
		const industry = industries.find((i) => i.id === a.industryId);
		const acctOpps = opportunities.filter((o) => o.accountId === a.id);
		return {
			id: a.id,
			name: a.name,
			industryName: industry?.name ?? '',
			tier: a.tier,
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
