<script lang="ts">
	import type { PageData } from './$types';
	import RiskBadge from '$lib/components/ui/RiskBadge.svelte';
	import MiniBarChart from '$lib/components/ui/MiniBarChart.svelte';
	import DonutChart from '$lib/components/ui/DonutChart.svelte';

	export let data: PageData;
	$: ({ managerData } = data);
	$: ({ teamMembers, stalledInterventions, pipelineByStage, adoptionSummary, topAccounts } = managerData);

	function fmt(n: number) {
		if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
		if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
		if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
		return `Rp ${n.toLocaleString('id-ID')}`;
	}

	const stageChartColors: Record<string, string> = {
		PROSPECT: '#9ca3af', QUALIFY: '#3b82f6', PROPOSE: '#f59e0b', NEGOTIATE: '#f97316', CLOSE: '#22c55e'
	};
</script>

<svelte:head><title>Manager Dashboard — AI Sales Advisor</title></svelte:head>

<div class="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 sm:py-6">
	<h1 class="text-xl sm:text-2xl font-bold text-gray-900">Manager Dashboard</h1>
	<p class="text-xs sm:text-sm text-gray-500 mt-0.5">Team performance, stalled interventions, and recommendation adoption</p>
</div>

<div class="px-4 sm:px-8 py-4 sm:py-6 space-y-6">
	<!-- Adoption summary -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<div class="stat-card">
			<p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Recommendations</p>
			<p class="text-2xl font-bold text-gray-900 mt-1">{adoptionSummary.totalRecommendations}</p>
		</div>
		<div class="stat-card">
			<p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Adopted</p>
			<p class="text-2xl font-bold text-green-600 mt-1">{adoptionSummary.adopted}</p>
		</div>
		<div class="stat-card">
			<p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Adoption Rate</p>
			<p class="text-2xl font-bold text-gray-900 mt-1">{Math.round(adoptionSummary.adoptionRate * 100)}%</p>
		</div>
	</div>

	<!-- Adoption donut chart -->
	<div class="card">
		<div class="card-header"><h2 class="text-sm font-semibold text-gray-900">Recommendation Adoption</h2></div>
		<div class="card-body flex justify-center py-4">
			<DonutChart
				segments={[
					{ label: 'Adopted', value: adoptionSummary.adopted, color: '#22c55e' },
					{ label: 'Pending', value: adoptionSummary.totalRecommendations - adoptionSummary.adopted, color: '#e5e7eb' }
				]}
				centerLabel="{Math.round(adoptionSummary.adoptionRate * 100)}%"
				centerSub="adoption"
			/>
		</div>
	</div>

	<div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
		<!-- Team summary -->
		<div class="card">
			<div class="card-header"><h2 class="text-sm font-semibold text-gray-900">Team Summary</h2></div>
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-gray-50 border-b border-gray-100">
						<tr>
							<th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Rep</th>
							<th class="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Open</th>
							<th class="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Pipeline</th>
							<th class="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Stalled</th>
							<th class="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Acts/Wk</th>
						</tr>
					</thead>
					<tbody>
						{#each teamMembers as tm}
						<tr class="border-b border-gray-50 hover:bg-gray-50">
							<td class="px-6 py-3 font-medium text-gray-900">{tm.name}</td>
							<td class="px-6 py-3 text-right">{tm.openOpportunities}</td>
							<td class="px-6 py-3 text-right font-semibold">{fmt(tm.pipelineValue)}</td>
							<td class="px-6 py-3 text-right">
								{#if tm.stalledDeals > 0}
									<span class="badge badge-red">{tm.stalledDeals}</span>
								{:else}
									<span class="badge badge-green">0</span>
								{/if}
							</td>
							<td class="px-6 py-3 text-right">
								<span class="{tm.activitiesThisWeek === 0 ? 'text-red-500 font-semibold' : 'text-gray-700'}">{tm.activitiesThisWeek}</span>
							</td>
						</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Pipeline by stage -->
		<div class="card">
			<div class="card-header"><h2 class="text-sm font-semibold text-gray-900">Pipeline by Stage</h2></div>
			<div class="card-body">
				<MiniBarChart
					data={pipelineByStage.map((s) => ({
						label: `${s.stageName} (${s.count})`,
						value: s.totalValue,
						color: stageChartColors[s.stageCode] ?? '#6b7280'
					}))}
					formatValue={fmt}
				/>
			</div>
		</div>
	</div>

	<!-- Stalled interventions -->
	{#if stalledInterventions.length}
	<div class="card">
		<div class="card-header flex items-center gap-2">
			<svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
			</svg>
			<h2 class="text-sm font-semibold text-gray-900">Deals Needing Intervention</h2>
		</div>
		<div class="divide-y divide-gray-50">
			{#each stalledInterventions as deal}
			<div class="px-6 py-4 flex items-start gap-4">
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-2 flex-wrap">
						<a href="/opportunities/{deal.opportunityId}" class="text-sm font-semibold text-brand-700 hover:underline">{deal.opportunityName}</a>
						<span class="badge {deal.stalledDays > 21 ? 'badge-red' : 'badge-yellow'}">{deal.stalledDays}d stalled</span>
						<RiskBadge risk={deal.riskLevel} />
					</div>
					<p class="text-xs text-gray-500 mt-0.5">{deal.accountName} · Assigned: {deal.assignedTo}</p>
					<div class="insight-box mt-2">
						<p class="text-xs"><span class="font-semibold">Suggested Action:</span> {deal.suggestedAction}</p>
					</div>
				</div>
			</div>
			{/each}
		</div>
	</div>
	{/if}

	<!-- Top accounts -->
	{#if topAccounts.length}
	<div class="card">
		<div class="card-header"><h2 class="text-sm font-semibold text-gray-900">Top Accounts by Pipeline</h2></div>
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead class="bg-gray-50 border-b border-gray-100">
					<tr>
						<th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Account</th>
						<th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Industry</th>
						<th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tier</th>
						<th class="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Open Opps</th>
					</tr>
				</thead>
				<tbody>
					{#each topAccounts as acc}
					<tr class="border-b border-gray-50 hover:bg-gray-50">
						<td class="px-6 py-3">
							<a href="/accounts/{acc.id}" class="font-semibold text-brand-700 hover:underline">{acc.name}</a>
						</td>
						<td class="px-6 py-3 text-gray-500">{acc.industryName}</td>
						<td class="px-6 py-3 capitalize text-gray-600">{acc.tier}</td>
						<td class="px-6 py-3 text-right font-medium">{acc.openOpportunities}</td>
					</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
	{/if}
</div>
