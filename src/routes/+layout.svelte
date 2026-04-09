<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import eomLogo from '$lib/assets/eon-chemicals-putra-logo.png';

	const navItems = [
		{ href: `${base}/`,              label: 'Dashboard',   icon: 'grid' },
		{ href: `${base}/accounts`,      label: 'Accounts',    icon: 'building' },
		{ href: `${base}/opportunities`, label: 'Opportunities', icon: 'target' },
		{ href: `${base}/manager`,       label: 'Manager',     icon: 'bar-chart' },
		{ href: `${base}/copilot`,       label: 'AI Copilot',  icon: 'bot' },
	];

	function isActive(href: string): boolean {
		if (href === `${base}/`) return $page.url.pathname === `${base}/` || $page.url.pathname === base;
		return $page.url.pathname.startsWith(href);
	}

	const icons: Record<string, string> = {
		grid: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>`,
		building: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>`,
		target: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>`,
		'bar-chart': `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>`,
		bot: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>`
	};

	let mobileMenuOpen = false;

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<div class="flex h-screen overflow-hidden bg-gray-50">
	<!-- Desktop Sidebar (lg and above) -->
	<aside class="hidden lg:flex w-60 bg-white border-r border-gray-200 flex-col flex-shrink-0">
		<!-- Logo -->
		<div class="px-6 py-4 border-b border-gray-100">
			<img src={eomLogo} alt="EON Chemical Solution" class="h-12 w-auto" />
		</div>

		<!-- Nav -->
		<nav class="flex-1 px-3 py-4 space-y-0.5">
			{#each navItems as item}
				<a
					href={item.href}
					class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
						{isActive(item.href)
							? 'bg-brand-50 text-brand-700'
							: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
				>
					<svg
						class="w-4.5 h-4.5 flex-shrink-0 w-[18px] h-[18px]"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						{@html icons[item.icon]}
					</svg>
					{item.label}
					{#if item.href === '/copilot'}
						<span class="ml-auto text-[10px] font-semibold bg-brand-100 text-brand-700 rounded px-1.5 py-0.5">AI</span>
					{/if}
				</a>
			{/each}
		</nav>

		<!-- User -->
		<div class="px-4 py-4 border-t border-gray-100">
			<div class="flex items-center gap-3">
				<div class="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
					JT
				</div>
				<div class="min-w-0">
					<p class="text-sm font-medium text-gray-900 truncate">James Thornton</p>
					<p class="text-xs text-gray-400 truncate">QLD / Marine</p>
				</div>
			</div>
		</div>
	</aside>

	<!-- Mobile top bar -->
	<div class="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<img src={eomLogo} alt="EON Chemical Solution" class="h-8 w-auto" />
		</div>
		<button
			on:click={() => mobileMenuOpen = !mobileMenuOpen}
			class="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
			aria-label="Toggle menu"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				{#if mobileMenuOpen}
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
				{:else}
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
				{/if}
			</svg>
		</button>
	</div>

	<!-- Mobile overlay sidebar -->
	{#if mobileMenuOpen}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="lg:hidden fixed inset-0 z-50 flex" on:click={closeMobileMenu}>
			<div class="absolute inset-0 bg-black/30"></div>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div class="relative w-64 bg-white flex flex-col shadow-xl" on:click|stopPropagation>
				<div class="px-6 py-4 border-b border-gray-100">
					<img src={eomLogo} alt="EON Chemical Solution" class="h-12 w-auto" />
				</div>
				<nav class="flex-1 px-3 py-4 space-y-0.5">
					{#each navItems as item}
						<a
							href={item.href}
							on:click={closeMobileMenu}
							class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
								{isActive(item.href)
									? 'bg-brand-50 text-brand-700'
									: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
						>
							<svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								{@html icons[item.icon]}
							</svg>
							{item.label}
						</a>
					{/each}
				</nav>
				<div class="px-4 py-4 border-t border-gray-100">
					<div class="flex items-center gap-3">
						<div class="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">JT</div>
						<div class="min-w-0">
							<p class="text-sm font-medium text-gray-900 truncate">James Thornton</p>
							<p class="text-xs text-gray-400 truncate">QLD / Marine</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Main content -->
	<main class="flex-1 overflow-y-auto scrollbar-thin lg:pb-0 pb-20 pt-14 lg:pt-0">
		<slot />
	</main>

	<!-- Mobile bottom navigation -->
	<nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex items-stretch">
		{#each navItems as item}
			<a
				href={item.href}
				class="flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-medium transition-colors
					{isActive(item.href) ? 'text-brand-700' : 'text-gray-400'}"
			>
				<svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					{@html icons[item.icon]}
				</svg>
				{item.label === 'Opportunities' ? 'Opps' : item.label}
			</a>
		{/each}
	</nav>
</div>
