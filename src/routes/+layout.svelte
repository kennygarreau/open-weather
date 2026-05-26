<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { theme } from '$lib/stores/theme';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let { children } = $props();

	onMount(() => theme.init());

	const isSettings = $derived($page.url.pathname === '/settings');
</script>

<div class="min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-gray-950 dark:text-white">
	<header class="flex items-center justify-between px-6 py-4">
		<a href="/" class="text-lg font-semibold tracking-tight">🌤 Open Weather</a>
		<div class="flex items-center gap-2">
			<a
				href={isSettings ? '/' : '/settings'}
				class="rounded-full p-2 text-sm text-gray-500 transition-colors hover:bg-black/10 dark:text-gray-400 dark:hover:bg-white/10"
				title={isSettings ? 'Back to weather' : 'Settings'}
			>
				{isSettings ? '← Weather' : '⚙️'}
			</a>
			<ThemeToggle />
		</div>
	</header>
	<main class="mx-auto max-w-2xl px-4 pb-16">
		{@render children()}
	</main>
</div>
