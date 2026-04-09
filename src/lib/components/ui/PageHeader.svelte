<script lang="ts">
	export let title: string;
	export let subtitle: string = '';
</script>

<div class="px-8 pt-8 pb-6 border-b border-gray-100 bg-white">
	<h1 class="text-2xl font-bold text-gray-900">{title}</h1>
	{#if subtitle}
		<p class="text-sm text-gray-500 mt-1">{subtitle}</p>
	{/if}
	<slot />
</div>
