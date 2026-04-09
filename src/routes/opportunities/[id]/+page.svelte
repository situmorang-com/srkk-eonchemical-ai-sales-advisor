<script lang="ts">
	import { base } from '$app/paths';
	import type { PageData } from './$types';
	import RiskBadge from '$lib/components/ui/RiskBadge.svelte';
	import StalledBadge from '$lib/components/ui/StalledBadge.svelte';
	import RecommendationCard from '$lib/components/ui/RecommendationCard.svelte';

	export let data: PageData;
	$: ({ opp } = data);

	function fmt(n: number) {
		if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
		if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
		if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
		return `Rp ${n.toLocaleString('id-ID')}`;
	}

	const stageColors: Record<string, string> = {
		PROSPECT: 'bg-gray-100 text-gray-600',
		QUAL: 'bg-blue-100 text-blue-700',
		PROPOSAL: 'bg-amber-100 text-amber-700',
		NEGOTIATION: 'bg-orange-100 text-orange-700',
		WON: 'bg-green-100 text-green-700'
	};

	const stageLabels: Record<string, string> = {
		PROSPECT: 'Prospect',
		QUAL: 'Qualification',
		PROPOSAL: 'Proposal',
		NEGOTIATION: 'Negotiation',
		WON: 'Closed Won'
	};

	const activityIcons: Record<string, string> = {
		call: '📞', email: '✉️', meeting: '🤝', demo: '🖥️',
		proposal: '📋', site_visit: '🏭', sample_sent: '📦', quote: '💰'
	};

	// Stage progress
	const stageOrder = ['PROSPECT', 'QUAL', 'PROPOSAL', 'NEGOTIATION', 'WON'];
	$: currentStageIndex = stageOrder.indexOf(opp.stageCode);
</script>

<svelte:head><title>{opp.name} — AI Sales Advisor</title></svelte:head>

<!-- Header -->
<div class="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 sm:py-6">
	<div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
		<div>
			<div class="flex items-center gap-2 mb-2 text-sm text-gray-400">
				<a href="{base}/opportunities" class="hover:text-gray-600">← Opportunities</a>
				<span>·</span>
				<a href="{base}/accounts/{opp.accountId}" class="hover:text-brand-600">{opp.accountName}</a>
			</div>
			<h1 class="text-2xl font-bold text-gray-900">{opp.name}</h1>
			<div class="flex items-center gap-3 mt-2 flex-wrap">
				<span class="px-3 py-1 rounded-full text-sm font-medium {stageColors[opp.stageCode] ?? 'bg-gray-100 text-gray-600'}">{opp.stageName}</span>
				<span class="text-lg font-bold text-gray-900">{fmt(opp.value)} {opp.currency}</span>
				<RiskBadge risk={opp.riskLevel} />
				{#if opp.isStalled}<StalledBadge days={opp.stalledDays} />{/if}
				<span class="text-sm text-gray-500">Close: {opp.closeDate}</span>
			</div>
		</div>
		<a href="{base}/copilot?context=opportunity&id={opp.id}" class="btn-primary text-sm flex-shrink-0">
			Ask AI Copilot
		</a>
	</div>

	<!-- Stage progress bar -->
	<div class="mt-6 flex items-center gap-0">
		{#each stageOrder as stage, i}
			<div class="flex items-center flex-1 {i < stageOrder.length - 1 ? '' : ''}">
				<div class="flex flex-col items-center flex-1">
					<div class="w-full flex items-center {i > 0 ? '' : 'pl-0'}">
						{#if i > 0}
							<div class="flex-1 h-0.5 {i <= currentStageIndex ? 'bg-brand-500' : 'bg-gray-200'}"></div>
						{/if}
						<div class="w-4 h-4 rounded-full flex-shrink-0 {i < currentStageIndex ? 'bg-brand-500' : i === currentStageIndex ? 'bg-brand-600 ring-4 ring-brand-100' : 'bg-gray-200'}"></div>
						{#if i < stageOrder.length - 1}
							<div class="flex-1 h-0.5 {i < currentStageIndex ? 'bg-brand-500' : 'bg-gray-200'}"></div>
						{/if}
					</div>
					<span class="text-xs mt-1.5 {i === currentStageIndex ? 'text-brand-700 font-semibold' : 'text-gray-400'}">{stageLabels[stage] ?? stage}</span>
				</div>
			</div>
		{/each}
	</div>
</div>

<div class="px-4 sm:px-8 py-4 sm:py-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
	<!-- Main content -->
	<div class="xl:col-span-2 space-y-6">
		<!-- Deal context -->
		<div class="card">
			<div class="card-header"><h2 class="text-sm font-semibold text-gray-900">Deal Context</h2></div>
			<div class="card-body grid grid-cols-1 sm:grid-cols-2 gap-6">
				<div>
					<p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Problem Statement</p>
					<p class="text-sm text-gray-700">{opp.problemStatement ?? 'Not recorded.'}</p>
				</div>
				<div>
					<p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Use Case</p>
					<p class="text-sm text-gray-700">{opp.useCase ?? 'Not recorded.'}</p>
				</div>
				{#if opp.competitorNotes}
				<div class="col-span-2">
					<p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Competitor Notes</p>
					<p class="text-sm text-gray-700">{opp.competitorNotes}</p>
				</div>
				{/if}
			</div>
		</div>

		<!-- Key metrics -->
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
			<div class="card p-4 text-center">
				<p class="text-2xl font-bold text-gray-900">{opp.ageInStageDays}d</p>
				<p class="text-xs text-gray-500 mt-1">Age in Stage</p>
			</div>
			<div class="card p-4 text-center">
				<p class="text-2xl font-bold text-gray-900">{Math.round(opp.stageProbability * 100)}%</p>
				<p class="text-xs text-gray-500 mt-1">Close Probability</p>
			</div>
			<div class="card p-4 text-center">
				<p class="text-2xl font-bold text-gray-900">{opp.activities.length}</p>
				<p class="text-xs text-gray-500 mt-1">Activities</p>
			</div>
			<div class="card p-4 text-center {opp.isStalled ? 'border-red-200 bg-red-50' : ''}">
				<p class="text-2xl font-bold {opp.isStalled ? 'text-red-600' : 'text-gray-900'}">{opp.stalledDays}d</p>
				<p class="text-xs {opp.isStalled ? 'text-red-500' : 'text-gray-500'} mt-1">Stalled Days</p>
			</div>
		</div>

		<!-- Activities timeline -->
		{#if opp.activities.length}
		<div class="card">
			<div class="card-header"><h2 class="text-sm font-semibold text-gray-900">Activity Timeline</h2></div>
			<div class="divide-y divide-gray-50">
				{#each opp.activities as act}
				<div class="px-6 py-4 flex gap-4">
					<div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-base flex-shrink-0">
						{activityIcons[act.type] ?? '📌'}
					</div>
					<div class="min-w-0 flex-1">
						<div class="flex items-start justify-between gap-2">
							<p class="text-sm font-semibold text-gray-900">{act.subject}</p>
							<span class="text-xs text-gray-400 flex-shrink-0">{act.activityDate}</span>
						</div>
						{#if act.description}
							<p class="text-xs text-gray-600 mt-1">{act.description}</p>
						{/if}
						{#if act.outcome}
							<p class="text-xs text-brand-700 mt-1 font-medium">→ {act.outcome}</p>
						{/if}
						<p class="text-xs text-gray-400 mt-1">{act.userName ?? 'Unknown'}{act.durationMinutes ? ` · ${act.durationMinutes}min` : ''}</p>
					</div>
				</div>
				{/each}
			</div>
		</div>
		{/if}

		<!-- Notes -->
		{#if opp.notes.length}
		<div class="card">
			<div class="card-header"><h2 class="text-sm font-semibold text-gray-900">Notes</h2></div>
			<div class="card-body space-y-3">
				{#each opp.notes as note}
				<div class="{note.isPinned ? 'bg-amber-50 border border-amber-100 rounded-lg p-3' : 'border-b border-gray-50 pb-3 last:border-0 last:pb-0'}">
					{#if note.isPinned}
						<p class="text-xs font-semibold text-amber-700 mb-1.5">📌 Pinned Note</p>
					{/if}
					<p class="text-sm text-gray-700">{note.content}</p>
					<p class="text-xs text-gray-400 mt-1.5">{note.userName} · {note.createdAt.slice(0,10)}</p>
				</div>
				{/each}
			</div>
		</div>
		{/if}
	</div>

	<!-- Right sidebar -->
	<div class="space-y-6">
		<!-- AI Recommendation -->
		{#if opp.recommendation}
			<RecommendationCard rec={opp.recommendation} />
		{:else}
			<div class="card card-body text-center text-gray-400 text-sm py-8">
				<p>No recommendation generated yet.</p>
				<p class="mt-1 text-xs">Ensure the account has industry data configured.</p>
			</div>
		{/if}

		<!-- Deal info -->
		<div class="card">
			<div class="card-header"><h3 class="text-sm font-semibold text-gray-900">Deal Details</h3></div>
			<div class="card-body space-y-3 text-sm">
				<div class="flex justify-between">
					<span class="text-gray-500">Account</span>
					<a href="{base}/accounts/{opp.accountId}" class="text-brand-600 hover:underline font-medium">{opp.accountName}</a>
				</div>
				<div class="flex justify-between">
					<span class="text-gray-500">Industry</span>
					<span class="text-gray-900">{opp.industryName}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-gray-500">Assigned To</span>
					<span class="text-gray-900">{opp.assignedUserName ?? '—'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-gray-500">Primary Product</span>
					<span class="text-gray-900">{opp.primaryProductName ?? '—'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-gray-500">Close Date</span>
					<span class="text-gray-900">{opp.closeDate}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-gray-500">Days Since Activity</span>
					<span class="{(opp.daysSinceActivity ?? 0) > 10 ? 'text-red-600 font-semibold' : 'text-gray-900'}">{opp.daysSinceActivity ?? '—'}d</span>
				</div>
			</div>
		</div>
	</div>
</div>
