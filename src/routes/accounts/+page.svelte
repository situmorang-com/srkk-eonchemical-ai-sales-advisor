<script lang="ts">
	import { base } from '$app/paths';
	import type { PageData } from './$types';
	import RiskBadge from '$lib/components/ui/RiskBadge.svelte';
	import type { AccountSummary } from '$lib/types';

	export let data: PageData;
	$: accounts = data.accounts;

	let search = '';
	let filterIndustry = '';
	let filterTier = '';

	$: industries = [...new Set(accounts.map((a) => a.industryName))].sort();

	$: filtered = accounts.filter((a) => {
		const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase());
		const matchIndustry = !filterIndustry || a.industryName === filterIndustry;
		const matchTier = !filterTier || a.tier === filterTier;
		return matchSearch && matchIndustry && matchTier;
	});

	const tierColors: Record<string, string> = {
		strategic: 'badge-purple',
		key: 'badge-blue',
		standard: 'badge-gray'
	};

	function fmtCurrency(n: number) {
		if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
		if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
		if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
		return `Rp ${n.toLocaleString('id-ID')}`;
	}
</script>

<svelte:head><title>Accounts — AI Sales Advisor</title></svelte:head>

<div class="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 sm:py-6">
	<h1 class="text-xl sm:text-2xl font-bold text-gray-900">Accounts</h1>
	<p class="text-xs sm:text-sm text-gray-500 mt-0.5">{accounts.length} accounts across {industries.length} industries</p>
</div>

<div class="px-4 sm:px-8 py-4 sm:py-6 space-y-4">
	<!-- Filters -->
	<div class="flex gap-3 flex-wrap">
		<input
			type="search"
			placeholder="Search accounts..."
			bind:value={search}
			class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-64"
		/>
		<select bind:value={filterIndustry} class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
			<option value="">All Industries</option>
			{#each industries as ind}<option value={ind}>{ind}</option>{/each}
		</select>
		<select bind:value={filterTier} class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
			<option value="">All Tiers</option>
			<option value="strategic">Strategic</option>
			<option value="key">Key</option>
			<option value="standard">Standard</option>
		</select>
		{#if search || filterIndustry || filterTier}
			<button on:click={() => { search = ''; filterIndustry = ''; filterTier = ''; }} class="btn-ghost text-xs">
				Clear filters
			</button>
		{/if}
	</div>

	<!-- Table -->
	<div class="card overflow-hidden overflow-x-auto">
		<table class="w-full text-sm min-w-[700px]">
			<thead class="bg-gray-50 border-b border-gray-100">
				<tr>
					<th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Account</th>
					<th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Industry</th>
					<th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tier</th>
					<th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Location</th>
					<th class="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Open Opps</th>
					<th class="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Total Purchases</th>
					<th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Assigned To</th>
				</tr>
			</thead>
			<tbody>
				{#each filtered as account}
				<tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
					<td class="px-6 py-3.5">
						<a href="{base}/accounts/{account.id}" class="font-semibold text-brand-700 hover:underline">{account.name}</a>
						<p class="text-xs text-gray-400 mt-0.5">{account.city ?? ''}{account.state ? `, ${account.state}` : ''}</p>
					</td>
					<td class="px-6 py-3.5 text-gray-600">{account.industryName}</td>
					<td class="px-6 py-3.5">
						<span class="badge {tierColors[account.tier] ?? 'badge-gray'} capitalize">{account.tier}</span>
					</td>
					<td class="px-6 py-3.5 text-gray-500">{account.state ?? ''}, {account.country}</td>
					<td class="px-6 py-3.5 text-right font-medium">{account.openOpportunities}</td>
					<td class="px-6 py-3.5 text-right font-semibold">{fmtCurrency(account.totalPurchaseValue)}</td>
					<td class="px-6 py-3.5 text-gray-500">{account.assignedUserName ?? '—'}</td>
				</tr>
				{:else}
				<tr>
					<td colspan="7" class="px-6 py-10 text-center text-gray-400 text-sm">No accounts match your filters.</td>
				</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
