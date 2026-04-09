<script lang="ts">
	import { base } from '$app/paths';
	import type { PageData } from './$types';
	import OpportunityRow from '$lib/components/ui/OpportunityRow.svelte';

	export let data: PageData;
	$: ({ account } = data);

	function fmt(n: number) {
		if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
		if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
		if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
		return `Rp ${n.toLocaleString('id-ID')}`;
	}

	const activityIcons: Record<string, string> = {
		call: '📞', email: '✉️', meeting: '🤝', demo: '🖥️',
		proposal: '📋', site_visit: '🏭', sample_sent: '📦', quote: '💰'
	};

	const tierColors: Record<string, string> = {
		strategic: 'badge-purple', key: 'badge-blue', standard: 'badge-gray'
	};
</script>

<svelte:head><title>{account.name} — AI Sales Advisor</title></svelte:head>

<!-- Header -->
<div class="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 sm:py-6">
	<div class="flex items-start justify-between">
		<div>
			<div class="flex items-center gap-3 mb-1">
				<a href="{base}/accounts" class="text-gray-400 hover:text-gray-600 text-sm">← Accounts</a>
			</div>
			<h1 class="text-2xl font-bold text-gray-900">{account.name}</h1>
			<div class="flex items-center gap-3 mt-2">
				<span class="badge {tierColors[account.tier] ?? 'badge-gray'} capitalize">{account.tier}</span>
				<span class="text-sm text-gray-500">{account.industryName}</span>
				<span class="text-sm text-gray-400">{account.city ?? ''}{account.state ? `, ${account.state}` : ''} {account.country}</span>
			</div>
		</div>
		<a href="{base}/copilot?context=account&id={account.id}" class="btn-primary text-sm">
			Ask AI Copilot
		</a>
	</div>
</div>

<div class="px-4 sm:px-8 py-4 sm:py-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
	<!-- Left: main content -->
	<div class="xl:col-span-2 space-y-6">
		<!-- Stats -->
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
			<div class="card p-4 text-center">
				<p class="text-2xl font-bold text-gray-900">{account.openOpportunities}</p>
				<p class="text-xs text-gray-500 mt-1">Open Opportunities</p>
			</div>
			<div class="card p-4 text-center">
				<p class="text-2xl font-bold text-gray-900">{fmt(account.totalPurchaseValue)}</p>
				<p class="text-xs text-gray-500 mt-1">Historical Purchases</p>
			</div>
			<div class="card p-4 text-center">
				<p class="text-2xl font-bold text-gray-900">{account.purchaseHistory.length}</p>
				<p class="text-xs text-gray-500 mt-1">Purchase Records</p>
			</div>
		</div>

		<!-- Purchase history -->
		<div class="card">
			<div class="card-header">
				<h2 class="text-sm font-semibold text-gray-900">Purchase History</h2>
			</div>
			{#if account.purchaseHistory.length}
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead class="bg-gray-50 border-b border-gray-100">
						<tr>
							<th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Product</th>
							<th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Family</th>
							<th class="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Volume (kg)</th>
							<th class="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Value</th>
							<th class="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
							<th class="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Recurring</th>
						</tr>
					</thead>
					<tbody>
						{#each account.purchaseHistory as h}
						<tr class="border-b border-gray-50 hover:bg-gray-50">
							<td class="px-6 py-3">
								<p class="font-medium text-gray-900">{h.productName}</p>
								<p class="text-xs text-gray-400">{h.productSku}</p>
							</td>
							<td class="px-6 py-3 text-gray-500">{h.familyName}</td>
							<td class="px-6 py-3 text-right">{h.volumeKg.toLocaleString()}</td>
							<td class="px-6 py-3 text-right font-semibold">{fmt(h.totalValue)}</td>
							<td class="px-6 py-3 text-gray-500">{h.purchaseDate}</td>
							<td class="px-6 py-3 text-center">
								{#if h.isRecurring}
									<span class="badge badge-green">Recurring</span>
								{:else}
									<span class="text-gray-300">—</span>
								{/if}
							</td>
						</tr>
						{/each}
					</tbody>
				</table>
			</div>
			{:else}
				<div class="card-body text-center text-gray-400 text-sm py-8">No purchase history recorded.</div>
			{/if}
		</div>

		<!-- Open opportunities -->
		{#if account.openOpportunityList.length}
		<div class="card">
			<div class="card-header">
				<h2 class="text-sm font-semibold text-gray-900">Open Opportunities</h2>
			</div>
			{#each account.openOpportunityList as opp}
				<OpportunityRow {opp} />
			{/each}
		</div>
		{/if}

		<!-- Recent activities -->
		{#if account.recentActivities.length}
		<div class="card">
			<div class="card-header">
				<h2 class="text-sm font-semibold text-gray-900">Recent Activities</h2>
			</div>
			<div class="divide-y divide-gray-50">
				{#each account.recentActivities as act}
				<div class="px-6 py-4 flex gap-4">
					<span class="text-lg flex-shrink-0 mt-0.5">{activityIcons[act.type] ?? '📌'}</span>
					<div class="min-w-0">
						<p class="text-sm font-medium text-gray-900">{act.subject}</p>
						{#if act.description}
							<p class="text-xs text-gray-500 mt-0.5 line-clamp-2">{act.description}</p>
						{/if}
						{#if act.outcome}
							<p class="text-xs text-brand-700 mt-1 font-medium">→ {act.outcome}</p>
						{/if}
						<p class="text-xs text-gray-400 mt-1">{act.activityDate} · {act.userName ?? 'Unknown'}</p>
					</div>
				</div>
				{/each}
			</div>
		</div>
		{/if}
	</div>

	<!-- Right: sidebar -->
	<div class="space-y-6">
		<!-- Account details -->
		<div class="card">
			<div class="card-header"><h3 class="text-sm font-semibold text-gray-900">Account Details</h3></div>
			<div class="card-body space-y-3 text-sm">
				<div class="flex justify-between">
					<span class="text-gray-500">Status</span>
					<span class="capitalize font-medium text-gray-900">{account.status}</span>
				</div>
				{#if account.website}
				<div class="flex justify-between">
					<span class="text-gray-500">Website</span>
					<a href={account.website} target="_blank" class="text-brand-600 hover:underline truncate max-w-[140px]">{account.website}</a>
				</div>
				{/if}
				{#if account.employeeCount}
				<div class="flex justify-between">
					<span class="text-gray-500">Employees</span>
					<span class="font-medium text-gray-900">{account.employeeCount.toLocaleString()}</span>
				</div>
				{/if}
				{#if account.annualRevenue}
				<div class="flex justify-between">
					<span class="text-gray-500">Annual Revenue</span>
					<span class="font-medium text-gray-900">{fmt(account.annualRevenue)}</span>
				</div>
				{/if}
				<div class="flex justify-between">
					<span class="text-gray-500">Assigned To</span>
					<span class="font-medium text-gray-900">{account.assignedUserName ?? '—'}</span>
				</div>
				{#if account.tags.length}
				<div>
					<p class="text-gray-500 mb-2">Tags</p>
					<div class="flex flex-wrap gap-1">
						{#each account.tags as tag}
							<span class="badge badge-gray">{tag}</span>
						{/each}
					</div>
				</div>
				{/if}
			</div>
		</div>

		<!-- Similar accounts -->
		{#if account.similarAccounts.length}
		<div class="card">
			<div class="card-header">
				<h3 class="text-sm font-semibold text-gray-900">Similar Accounts</h3>
				<p class="text-xs text-gray-400 mt-0.5">Same industry · {account.industryName}</p>
			</div>
			<div class="card-body space-y-2">
				{#each account.similarAccounts as sim}
				<a href="{base}/accounts/{sim.id}" class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
					<div class="min-w-0">
						<p class="text-sm font-medium text-gray-900 truncate">{sim.name}</p>
						<p class="text-xs text-gray-400">{sim.city ?? ''}, {sim.state ?? ''}</p>
					</div>
					<span class="text-xs text-brand-600 ml-2 flex-shrink-0">→</span>
				</a>
				{/each}
			</div>
		</div>
		{/if}

		<!-- Notes -->
		{#if account.notes.length}
		<div class="card">
			<div class="card-header"><h3 class="text-sm font-semibold text-gray-900">Notes</h3></div>
			<div class="card-body space-y-3">
				{#each account.notes as note}
				<div class="text-sm {note.isPinned ? 'bg-amber-50 border border-amber-100 rounded-lg p-3' : ''}">
					{#if note.isPinned}
						<p class="text-xs font-semibold text-amber-700 mb-1">📌 Pinned</p>
					{/if}
					<p class="text-gray-700">{note.content}</p>
					<p class="text-xs text-gray-400 mt-1">{note.userName} · {note.createdAt.slice(0,10)}</p>
				</div>
				{/each}
			</div>
		</div>
		{/if}
	</div>
</div>
