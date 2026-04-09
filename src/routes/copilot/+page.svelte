<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { CopilotMessage, CopilotSource } from '$lib/types';
	import { page } from '$app/stores';

	let messages: CopilotMessage[] = [];
	let inputValue = '';
	let loading = false;
	let messagesEl: HTMLDivElement;

	// Context from URL params
	$: contextType = ($page.url.searchParams.get('context') ?? 'general') as CopilotMessage['contextType'];
	$: contextId   = $page.url.searchParams.get('id') ?? undefined;

	const suggestions = [
		'What should I propose for this opportunity?',
		'Why is this deal stuck?',
		'What upsell or cross-sell opportunities exist?',
		'What is the next best action?',
		'Give me a pipeline summary',
	];

	onMount(() => {
		messages = [{
			id: 'welcome',
			role: 'assistant',
			content: contextType !== 'general' && contextId
				? `I'm your AI Sales Advisor. I have context on this ${contextType}. Ask me anything — what to propose, why it's stuck, or what to do next.`
				: `Hello! I'm your AI Sales Advisor. I can help you with product recommendations, deal diagnostics, upsell opportunities, and pipeline analysis.\n\nTip: For the most relevant advice, ask me from within a specific opportunity or account page.`,
			timestamp: new Date().toISOString()
		}];
	});

	async function sendMessage(msg?: string) {
		const text = (msg ?? inputValue).trim();
		if (!text || loading) return;

		inputValue = '';

		const userMsg: CopilotMessage = {
			id: `user-${Date.now()}`,
			role: 'user',
			content: text,
			timestamp: new Date().toISOString(),
			contextType,
			contextId
		};
		messages = [...messages, userMsg];

		loading = true;
		await tick();
		scrollToBottom();

		try {
			const res = await fetch('/api/copilot', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: text,
					contextType,
					contextId,
					conversationHistory: messages.slice(-6)
				})
			});
			const { content, sources } = await res.json();

			const assistantMsg: CopilotMessage = {
				id: `assistant-${Date.now()}`,
				role: 'assistant',
				content,
				timestamp: new Date().toISOString(),
				sources
			};
			messages = [...messages, assistantMsg];
		} catch {
			messages = [...messages, {
				id: `err-${Date.now()}`,
				role: 'assistant',
				content: 'Sorry, something went wrong. Please try again.',
				timestamp: new Date().toISOString()
			}];
		} finally {
			loading = false;
			await tick();
			scrollToBottom();
		}
	}

	function scrollToBottom() {
		if (messagesEl) {
			messagesEl.scrollTop = messagesEl.scrollHeight;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}

	// Simple markdown-ish renderer
	function renderContent(text: string): string {
		return text
			.replace(/^## (.+)$/gm, '<h3 class="text-base font-bold text-gray-900 mt-4 mb-2 first:mt-0">$1</h3>')
			.replace(/^### (.+)$/gm, '<h4 class="text-sm font-bold text-gray-800 mt-3 mb-1">$1</h4>')
			.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
			.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm">$1</li>')
			.replace(/\n{2,}/g, '</p><p class="mt-2">')
			.replace(/\n/g, '<br/>')
			.replace(/^(?!<)/, '<p class="text-sm">')
			+ '</p>';
	}
</script>

<svelte:head><title>AI Copilot — Sales Advisor</title></svelte:head>

<div class="flex flex-col h-full">
	<!-- Header -->
	<div class="bg-white border-b border-gray-100 px-4 sm:px-8 py-5 flex-shrink-0">
		<div class="flex items-center gap-3">
			<div class="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
				<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
				</svg>
			</div>
			<div>
				<h1 class="text-lg font-bold text-gray-900">AI Sales Copilot</h1>
				<p class="text-xs text-gray-400">
					{#if contextType !== 'general' && contextId}
						Contextualised for {contextType} · {contextId}
					{:else}
						Ask me anything about your pipeline
					{/if}
				</p>
			</div>
		</div>
	</div>

	<!-- Messages -->
	<div bind:this={messagesEl} class="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-4 scrollbar-thin">
		{#each messages as msg (msg.id)}
		<div class="flex {msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3">
			{#if msg.role === 'assistant'}
				<div class="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
					<svg class="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
					</svg>
				</div>
			{/if}

			<div class="max-w-2xl {msg.role === 'user' ? 'bg-brand-600 text-white rounded-2xl rounded-tr-sm px-4 py-3' : 'bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm'}">
				{#if msg.role === 'user'}
					<p class="text-sm">{msg.content}</p>
				{:else}
					<div class="prose-sm text-gray-700 leading-relaxed">
						{@html renderContent(msg.content)}
					</div>
					{#if msg.sources && msg.sources.length}
						<div class="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
							{#each msg.sources as source}
								<span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{source.label}</span>
							{/each}
						</div>
					{/if}
				{/if}
				<p class="text-[10px] opacity-50 mt-1.5 {msg.role === 'user' ? 'text-white text-right' : 'text-gray-400'}">
					{new Date(msg.timestamp).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
				</p>
			</div>
		</div>
		{/each}

		{#if loading}
		<div class="flex gap-3">
			<div class="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
				<svg class="w-4 h-4 text-brand-600 animate-spin" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
				</svg>
			</div>
			<div class="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
				<div class="flex gap-1.5 items-center h-5">
					<div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
					<div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
					<div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
				</div>
			</div>
		</div>
		{/if}
	</div>

	<!-- Suggestions (shown when empty) -->
	{#if messages.length <= 1 && !loading}
	<div class="px-4 sm:px-8 pb-2 flex flex-wrap gap-2">
		{#each suggestions as s}
		<button on:click={() => sendMessage(s)} class="text-xs px-3 py-1.5 rounded-full border border-brand-200 text-brand-700 hover:bg-brand-50 transition-colors">
			{s}
		</button>
		{/each}
	</div>
	{/if}

	<!-- Input -->
	<div class="bg-white border-t border-gray-100 px-4 sm:px-8 py-4 flex-shrink-0">
		<div class="flex gap-3 items-end max-w-4xl">
			<div class="flex-1 relative">
				<textarea
					bind:value={inputValue}
					on:keydown={handleKeydown}
					placeholder="Ask me about a product recommendation, deal diagnosis, or pipeline overview..."
					rows="2"
					class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent scrollbar-thin"
					disabled={loading}
				/>
			</div>
			<button
				on:click={() => sendMessage()}
				disabled={!inputValue.trim() || loading}
				class="btn-primary h-11 w-11 p-0 flex-shrink-0 justify-center"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
				</svg>
			</button>
		</div>
	</div>
</div>
