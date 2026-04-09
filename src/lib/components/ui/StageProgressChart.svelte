<script lang="ts">
	export let stages: { name: string; count: number; value: number }[];
	export let formatValue: (n: number) => string = (n) => n.toLocaleString('id-ID');

	const stageColors: Record<string, string> = {
		PROSPECT:  '#9ca3af',
		QUALIFY:   '#3b82f6',
		PROPOSE:   '#f59e0b',
		NEGOTIATE: '#f97316',
		CLOSE:     '#22c55e'
	};

	$: totalValue = stages.reduce((s, st) => s + st.value, 0);
	$: totalCount = stages.reduce((s, st) => s + st.count, 0);
</script>

<div class="space-y-4">
	<!-- Stacked bar -->
	{#if totalValue > 0}
	<div>
		<div class="flex h-6 rounded-lg overflow-hidden">
			{#each stages.filter((s) => s.value > 0) as stage}
				<div
					class="flex items-center justify-center transition-all duration-500 relative group"
					style="width: {(stage.value / totalValue) * 100}%; background-color: {stageColors[stage.name] ?? '#6b7280'}"
				>
					{#if (stage.value / totalValue) > 0.12}
						<span class="text-[10px] font-semibold text-white">{stage.count}</span>
					{/if}
				</div>
			{/each}
		</div>
		<div class="flex justify-between mt-1.5">
			<span class="text-xs text-gray-400">{totalCount} deals</span>
			<span class="text-xs font-semibold text-gray-600">{formatValue(totalValue)} total</span>
		</div>
	</div>
	{/if}

	<!-- Legend rows -->
	<div class="space-y-2">
		{#each stages as stage}
			<div class="flex items-center gap-3">
				<div class="w-3 h-3 rounded-sm flex-shrink-0" style="background-color: {stageColors[stage.name] ?? '#6b7280'}"></div>
				<span class="text-xs font-medium text-gray-700 w-20">{stage.name.charAt(0) + stage.name.slice(1).toLowerCase()}</span>
				<span class="text-xs text-gray-500">{stage.count} deals</span>
				<span class="text-xs font-semibold text-gray-900 ml-auto">{formatValue(stage.value)}</span>
			</div>
		{/each}
	</div>
</div>
