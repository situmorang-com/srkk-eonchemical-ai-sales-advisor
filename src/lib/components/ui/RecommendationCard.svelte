<script lang="ts">
	import ConfidenceBar from './ConfidenceBar.svelte';
	import type { RecommendationResult } from '$lib/types';

	export let rec: RecommendationResult;
	export let compact: boolean = false;

	function fmt(n: number) {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
	}
</script>

<div class="card">
	<div class="card-header flex items-center justify-between">
		<div class="flex items-center gap-2">
			<div class="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center">
				<svg class="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
				</svg>
			</div>
			<h3 class="text-sm font-semibold text-gray-900">AI Recommendation</h3>
		</div>
		<span class="text-xs text-gray-400">Generated {new Date(rec.generatedAt).toLocaleDateString('id-ID')}</span>
	</div>

	<div class="card-body space-y-5">
		<!-- Primary recommendation -->
		<div>
			<p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Primary Product</p>
			<div class="flex items-start justify-between gap-4">
				<div>
					<p class="font-semibold text-gray-900">{rec.primaryProduct.name}</p>
					<p class="text-xs text-gray-500 mt-0.5">{rec.primaryProduct.sku} · {rec.primaryProduct.familyName}</p>
					<p class="text-sm text-gray-600 mt-0.5">
						{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(rec.primaryProduct.unitPrice)}/{rec.primaryProduct.uom}
					</p>
				</div>
				<div class="text-right flex-shrink-0">
					<p class="text-xs text-gray-400 mb-1">Confidence</p>
					<div class="w-40">
						<ConfidenceBar score={rec.confidenceScore} />
					</div>
				</div>
			</div>

			<!-- Explanation -->
			<div class="insight-box mt-3">
				<p class="font-medium text-brand-800 mb-1 text-xs uppercase tracking-wide">Why this product?</p>
				<p class="text-brand-900">{rec.primaryReasoning}</p>
			</div>
		</div>

		{#if !compact}
		<!-- Score breakdown -->
		<div>
			<p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Score Breakdown</p>
			<div class="grid grid-cols-2 gap-2">
				{#each [
					{ label: 'Industry Fit', v: rec.scoreBreakdown.industryFit },
					{ label: 'Similar Accounts', v: rec.scoreBreakdown.similarAccounts },
					{ label: 'Account Affinity', v: rec.scoreBreakdown.affinity },
					{ label: 'Use-Case Fit', v: rec.scoreBreakdown.useCaseFit }
				] as s}
					<div class="flex flex-col gap-1">
						<div class="flex justify-between">
							<span class="text-xs text-gray-500">{s.label}</span>
							<span class="text-xs font-medium text-gray-700">{Math.round(s.v * 100)}%</span>
						</div>
						<div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
							<div class="h-full bg-brand-500 rounded-full" style="width: {Math.round(s.v * 100)}%"></div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Upsell / Cross-sell -->
		{#if rec.upsellProduct || rec.crossSellProduct}
		<div class="grid grid-cols-1 gap-3 {rec.upsellProduct && rec.crossSellProduct ? 'sm:grid-cols-2' : ''}">
			{#if rec.upsellProduct}
			<div class="rounded-lg border border-amber-100 bg-amber-50 p-3">
				<p class="text-xs font-semibold text-amber-700 mb-1">Upsell Opportunity</p>
				<p class="text-sm font-medium text-gray-900">{rec.upsellProduct.name}</p>
				<p class="text-xs text-gray-500 mt-0.5">{rec.upsellProduct.familyName}</p>
				{#if rec.upsellReasoning}
					<p class="text-xs text-amber-800 mt-2 line-clamp-3">{rec.upsellReasoning}</p>
				{/if}
			</div>
			{/if}
			{#if rec.crossSellProduct}
			<div class="rounded-lg border border-purple-100 bg-purple-50 p-3">
				<p class="text-xs font-semibold text-purple-700 mb-1">Cross-Sell Opportunity</p>
				<p class="text-sm font-medium text-gray-900">{rec.crossSellProduct.name}</p>
				<p class="text-xs text-gray-500 mt-0.5">{rec.crossSellProduct.familyName}</p>
				{#if rec.crossSellReasoning}
					<p class="text-xs text-purple-800 mt-2 line-clamp-3">{rec.crossSellReasoning}</p>
				{/if}
			</div>
			{/if}
		</div>
		{/if}
		{/if}

		<!-- Next best action -->
		<div class="rounded-lg border border-green-200 bg-green-50 p-4">
			<p class="text-xs font-semibold text-green-700 mb-1 uppercase tracking-wide">Next Best Action</p>
			<p class="text-sm font-semibold text-gray-900">{rec.nextBestAction}</p>
			{#if rec.actionReasoning}
				<p class="text-xs text-green-800 mt-1.5">{rec.actionReasoning}</p>
			{/if}
		</div>
	</div>
</div>
