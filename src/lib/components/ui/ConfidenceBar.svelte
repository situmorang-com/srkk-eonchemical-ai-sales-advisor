<script lang="ts">
	export let score: number; // 0-1
	$: pct = Math.round(score * 100);
	$: color = score >= 0.75 ? '#16a34a' : score >= 0.5 ? '#d97706' : '#dc2626';
	$: label = score >= 0.75 ? 'High' : score >= 0.5 ? 'Medium' : 'Low';
</script>

<div class="flex items-center gap-3">
	<div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
		<div class="h-full rounded-full transition-all duration-500" style="width: {pct}%; background: {color}"></div>
	</div>
	<span class="text-xs font-semibold whitespace-nowrap" style="color: {color}">{label} ({pct}%)</span>
</div>
