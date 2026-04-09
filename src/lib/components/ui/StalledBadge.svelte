<script lang="ts">
	export let days: number;
</script>

{#if days > 0}
	<span class="badge {days > 21 ? 'badge-red' : 'badge-yellow'}">
		Stalled {days}d
	</span>
{/if}
