<script lang="ts">
	import type { PageData } from './$types';
	import OpportunityRow from '$lib/components/ui/OpportunityRow.svelte';

	export let data: PageData;
	$: opportunities = data.opportunities;

	let search = '';
	let filterStage = '';
	let filterRisk = '';
	let showStalled = false;

	$: stages = [...new Set(opportunities.map((o) => o.stageName))].sort();

	$: filtered = opportunities.filter((o) => {
		if (search && !o.name.toLowerCase().includes(search.toLowerCase()) && !o.accountName.toLowerCase().includes(search.toLowerCase())) return false;
		if (filterStage && o.stageName !== filterStage) return false;
		if (filterRisk && o.riskLevel !== filterRisk) return false;
		if (showStalled && !o.isStalled) return false;
		return true;
	});

	$: totalValue = filtered.reduce((s, o) => s + o.value, 0);

	function fmt(n: number) {
		if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
		if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
		if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
		return `Rp ${n.toLocaleString('id-ID')}`;
	}
</script>

<svelte:head><title>Opportunities — AI Sales Advisor</title></svelte:head>

<div class="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 sm:py-6">
	<h1 class="text-xl sm:text-2xl font-bold text-gray-900">Opportunities</h1>
	<p class="text-xs sm:text-sm text-gray-500 mt-0.5">{filtered.length} opportunities · {fmt(totalValue)} pipeline</p>
</div>

<div class="px-4 sm:px-8 py-4 sm:py-6 space-y-4">
	<div class="flex gap-3 flex-wrap items-center">
		<input type="search" placeholder="Search by name or account..." bind:value={search}
			class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-72" />
		<select bind:value={filterStage} class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
			<option value="">All Stages</option>
			{#each stages as s}<option value={s}>{s}</option>{/each}
		</select>
		<select bind:value={filterRisk} class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
			<option value="">All Risk Levels</option>
			<option value="high">High Risk</option>
			<option value="medium">Medium</option>
			<option value="low">Low Risk</option>
		</select>
		<label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
			<input type="checkbox" bind:checked={showStalled} class="rounded border-gray-300 text-brand-600" />
			Stalled only
		</label>
	</div>

	<div class="card overflow-hidden">
		<!-- Column headers -->
		<div class="hidden sm:flex items-center gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wide">
			<span class="flex-1">Opportunity · Account</span>
			<span class="w-24 text-center">Stage</span>
			<span class="w-20 text-right">Value</span>
			<span class="w-24 text-center">Risk</span>
			<span class="w-24 text-right">Close Date</span>
		</div>
		{#each filtered as opp}
			<OpportunityRow {opp} />
		{:else}
			<div class="px-6 py-10 text-center text-gray-400 text-sm">No opportunities match your filters.</div>
		{/each}
	</div>
</div>
