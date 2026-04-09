<script lang="ts">
	export let risk: 'low' | 'medium' | 'high';
	const map = { low: 'green', medium: 'yellow', high: 'red' } as const;
</script>

<span class="badge badge-{map[risk]}">
	{#if risk === 'high'}⚠ High Risk{:else if risk === 'medium'}~ Medium{:else}Low Risk{/if}
</span>
