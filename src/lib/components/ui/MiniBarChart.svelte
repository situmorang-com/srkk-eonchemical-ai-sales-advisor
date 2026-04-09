<script lang="ts">
	export let data: { label: string; value: number; color?: string }[];
	export let formatValue: (n: number) => string = (n) => n.toLocaleString('id-ID');

	$: maxValue = Math.max(...data.map((d) => d.value), 1);
</script>

<div class="space-y-3">
	{#each data as item}
		<div>
			<div class="flex justify-between items-center mb-1">
				<span class="text-xs font-medium text-gray-700">{item.label}</span>
				<span class="text-xs font-semibold text-gray-900">{formatValue(item.value)}</span>
			</div>
			<div class="h-2 bg-gray-100 rounded-full overflow-hidden">
				<div
					class="h-full rounded-full transition-all duration-500"
					style="width: {Math.round((item.value / maxValue) * 100)}%; background-color: {item.color ?? '#4f46e5'}"
				></div>
			</div>
		</div>
	{/each}
</div>
