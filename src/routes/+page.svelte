<script lang="ts">
	import { base } from '$app/paths';
	import { opportunities, opportunityStages, accounts } from '$lib/stores/data';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import OpportunityRow from '$lib/components/ui/OpportunityRow.svelte';
	import RiskBadge from '$lib/components/ui/RiskBadge.svelte';
	import StageProgressChart from '$lib/components/ui/StageProgressChart.svelte';

	function fmtCurrency(n: number) {
		if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
		if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
		if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
		return `Rp ${n.toLocaleString('id-ID')}`;
	}

	const urgencyColor = {
		high: 'bg-red-50 border-red-200 text-red-700',
		medium: 'bg-amber-50 border-amber-200 text-amber-700',
		low: 'bg-gray-50 border-gray-200 text-gray-600'
	};

	// Computed dashboard data from stores
	$: {
		$opportunities;
		$accounts;
		$opportunityStages;
	}

	function getClosingThisMonth() {
		const now = new Date();
		const currentMonth = now.getMonth();
		const currentYear = now.getFullYear();

		const closing = $opportunities.filter(opp => {
			const closeDate = new Date(opp.closeDate);
			return closeDate.getMonth() === currentMonth && closeDate.getFullYear() === currentYear;
		});

		return {
			count: closing.length,
			value: closing.reduce((sum, o) => sum + (o.value || 0), 0)
		};
	}

	function getAverageDealAge() {
		if ($opportunities.length === 0) return 0;
		// Use stalledDays as proxy for deal age
		// For stalled deals, this is actual days; for non-stalled, this is 0 (conservative estimate)
		const totalDays = $opportunities.reduce((sum, o) => sum + (o.stalledDays || 0), 0);
		return Math.round(totalDays / $opportunities.length);
	}

	$: stats = {
		totalPipelineValue: $opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0),
		openOpportunities: $opportunities.length,
		stalledDeals: $opportunities.filter(o => o.isStalled).length,
		avgDealAge: getAverageDealAge(),
		closingThisMonth: getClosingThisMonth().count,
		closingThisMonthValue: getClosingThisMonth().value,
		winRateEstimate: 0.35
	};

	$: priorityOpportunities = $opportunities
		.filter(o => !o.isStalled)
		.slice(0, 5)
		.map(opp => {
			const account = $accounts.find(a => a.id === opp.accountId);
			const stage = $opportunityStages.find(s => s.id === opp.stageId);
			return { ...opp, accountName: account?.name || 'Unknown', stageName: stage?.name || '' };
		});

	$: stalledDeals = $opportunities
		.filter(o => o.isStalled)
		.map(opp => {
			const account = $accounts.find(a => a.id === opp.accountId);
			const stage = $opportunityStages.find(s => s.id === opp.stageId);
			return { ...opp, accountName: account?.name || 'Unknown', stageName: stage?.name || '' };
		});

	$: recommendedActions = $opportunities
		.slice(0, 3)
		.map(opp => {
			const account = $accounts.find(a => a.id === opp.accountId);
			return {
				opportunityId: opp.id,
				accountName: account?.name || 'Unknown',
				action: `Follow up on ${opp.name}`,
				reason: opp.problemStatement?.substring(0, 60) + '...',
				urgency: opp.isStalled ? 'high' : (opp.stalledDays || 0) > 7 ? 'medium' : 'low'
			};
		});

	$: pipelineByStage = $opportunityStages.map(stage => {
		const stageOpps = $opportunities.filter(o => o.stageId === stage.id);
		return {
			stageCode: stage.code,
			count: stageOpps.length,
			totalValue: stageOpps.reduce((sum, o) => sum + (o.value || 0), 0)
		};
	});
</script>

<svelte:head><title>Dashboard — AI Sales Advisor</title></svelte:head>

<!-- Page header -->
<div class="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 sm:py-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-xl sm:text-2xl font-bold text-gray-900">Sales Dashboard</h1>
			<p class="text-xs sm:text-sm text-gray-500 mt-0.5">Priority opportunities, stalled deals, and recommended actions</p>
		</div>
		<div class="text-right hidden sm:block">
			<p class="text-xs text-gray-400">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
		</div>
	</div>
</div>

<div class="px-4 sm:px-8 py-4 sm:py-6 space-y-6">
	<!-- Stats row -->
	<div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
		<StatCard label="Pipeline Value"   value={fmtCurrency(stats.totalPipelineValue)} sub="open opportunities" />
		<StatCard label="Open Deals"       value={stats.openOpportunities} sub="across all stages" />
		<StatCard label="Stalled Deals"    value={stats.stalledDeals} sub="need attention" color="red" />
		<StatCard label="Avg Deal Age"     value="{stats.avgDealAge}d" sub="all open opps" />
		<StatCard label="Closing This Month" value={stats.closingThisMonth} sub={fmtCurrency(stats.closingThisMonthValue)} color="green" />
		<StatCard label="Win Rate Est."    value="{Math.round(stats.winRateEstimate * 100)}%" sub="trailing 12m" color="blue" />
	</div>

	<!-- Pipeline by Stage chart -->
	{#if pipelineByStage.length}
	<div class="card">
		<div class="card-header">
			<h2 class="text-sm font-semibold text-gray-900">Pipeline by Stage</h2>
		</div>
		<div class="card-body">
			<StageProgressChart
				stages={pipelineByStage.map((s) => ({ name: s.stageCode, count: s.count, value: s.totalValue }))}
				formatValue={fmtCurrency}
			/>
		</div>
	</div>
	{/if}

	<div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
		<!-- Priority opportunities -->
		<div class="xl:col-span-2 card">
			<div class="card-header flex items-center justify-between">
				<h2 class="text-sm font-semibold text-gray-900">Priority Opportunities</h2>
				<a href="{base}/opportunities" class="text-xs text-brand-600 hover:text-brand-700 font-medium">View all</a>
			</div>
			<div>
				{#each priorityOpportunities as opp}
					<OpportunityRow {opp} />
				{/each}
			</div>
		</div>

		<!-- Recommended actions -->
		<div class="card">
			<div class="card-header">
				<h2 class="text-sm font-semibold text-gray-900">Recommended Actions</h2>
			</div>
			<div class="card-body space-y-3">
				{#each recommendedActions as action}
					<a href="{base}/opportunities/{action.opportunityId}" class="block rounded-lg border p-3 hover:shadow-sm transition-shadow {urgencyColor[action.urgency]}">
						<div class="flex items-start justify-between gap-2 mb-1">
							<p class="text-xs font-semibold truncate">{action.accountName}</p>
							<span class="text-[10px] font-bold uppercase flex-shrink-0 opacity-70">{action.urgency}</span>
						</div>
						<p class="text-xs font-medium leading-snug">{action.action}</p>
						<p class="text-xs opacity-70 mt-1 line-clamp-2">{action.reason}</p>
					</a>
				{/each}
			</div>
		</div>
	</div>

	<!-- Stalled deals -->
	{#if stalledDeals.length}
	<div class="card">
		<div class="card-header flex items-center gap-2">
			<svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
			</svg>
			<h2 class="text-sm font-semibold text-gray-900">Stalled Deals — Needs Attention</h2>
			<span class="badge badge-red">{stalledDeals.length}</span>
		</div>
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-gray-100">
						<th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Opportunity</th>
						<th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Account</th>
						<th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Stage</th>
						<th class="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Value</th>
						<th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Stalled</th>
						<th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Risk</th>
					</tr>
				</thead>
				<tbody>
					{#each stalledDeals as opp}
					<tr class="border-b border-gray-50 hover:bg-gray-50">
						<td class="px-6 py-3">
							<a href="{base}/opportunities/{opp.id}" class="font-medium text-brand-700 hover:underline">{opp.name}</a>
						</td>
						<td class="px-6 py-3 text-gray-500">{opp.accountName}</td>
						<td class="px-6 py-3 text-gray-500">{opp.stageName}</td>
						<td class="px-6 py-3 text-right font-semibold">{fmtCurrency(opp.value)}</td>
						<td class="px-6 py-3">
							<span class="badge {opp.stalledDays > 21 ? 'badge-red' : 'badge-yellow'}">{opp.stalledDays} days</span>
						</td>
						<td class="px-6 py-3"><RiskBadge risk={opp.riskLevel} /></td>
					</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
	{/if}
</div>
