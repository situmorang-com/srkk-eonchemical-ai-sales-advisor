<script lang="ts">
	import { base } from '$app/paths';
	import RiskBadge from './RiskBadge.svelte';
	import StalledBadge from './StalledBadge.svelte';
	import type { OpportunitySummary } from '$lib/types';

	export let opp: OpportunitySummary;

	function fmt(n: number) {
		if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
		if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
		if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
		return `Rp ${n.toLocaleString('id-ID')}`;
	}

	const stageColors: Record<string, string> = {
		PROSPECT:  'bg-gray-100 text-gray-600',
		QUALIFY:   'bg-blue-100 text-blue-700',
		PROPOSE:   'bg-amber-100 text-amber-700',
		NEGOTIATE: 'bg-orange-100 text-orange-700',
		CLOSE:     'bg-green-100 text-green-700'
	};
</script>

<a href="{base}/opportunities/{opp.id}" class="block sm:flex sm:items-center gap-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group">
	<div class="min-w-0 flex-1">
		<div class="flex items-center gap-2">
			<p class="text-sm font-semibold text-gray-900 truncate group-hover:text-brand-700">{opp.name}</p>
			{#if opp.isStalled}
				<StalledBadge days={opp.stalledDays} />
			{/if}
		</div>
		<p class="text-xs text-gray-500 mt-0.5 truncate">{opp.accountName} · {opp.industryName}</p>
	</div>

	<div class="flex items-center gap-3 sm:gap-4 flex-shrink-0 mt-2 sm:mt-0 flex-wrap sm:flex-nowrap">
		<span class="text-xs px-2 py-1 rounded-md font-medium {stageColors[opp.stageCode] ?? 'bg-gray-100 text-gray-600'}">
			{opp.stageName}
		</span>
		<span class="text-sm font-semibold text-gray-900">{fmt(opp.value)}</span>
		<RiskBadge risk={opp.riskLevel} />
		<span class="text-xs text-gray-400 sm:w-24 sm:text-right">{opp.closeDate}</span>
	</div>
</a>
