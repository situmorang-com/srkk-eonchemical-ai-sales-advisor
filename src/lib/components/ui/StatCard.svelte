<script lang="ts">
	export let label: string;
	export let value: string | number;
	export let sub: string = '';
	export let trend: 'up' | 'down' | 'neutral' = 'neutral';
	export let color: 'blue' | 'green' | 'red' | 'amber' | 'gray' = 'blue';

	const colorMap = {
		blue:  'text-brand-600 bg-brand-50',
		green: 'text-green-600 bg-green-50',
		red:   'text-red-600 bg-red-50',
		amber: 'text-amber-600 bg-amber-50',
		gray:  'text-gray-600 bg-gray-50'
	};
</script>

<div class="stat-card">
	<p class="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
	<p class="text-2xl font-bold text-gray-900 mt-1">{value}</p>
	{#if sub}
		<p class="text-xs text-gray-500 mt-0.5">{sub}</p>
	{/if}
</div>
