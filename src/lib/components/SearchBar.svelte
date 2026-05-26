<script lang="ts">
	import { selectedLocation } from '$lib/stores/location';
	import type { GeocodingResult } from '$lib/api/types';

	let query = $state('');
	let results = $state<GeocodingResult[]>([]);
	let loading = $state(false);
	let open = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout>;

	async function search(q: string) {
		if (!q.trim()) {
			results = [];
			open = false;
			return;
		}
		loading = true;
		try {
			const res = await fetch(`/api/geocoding?q=${encodeURIComponent(q)}`);
			const data = await res.json();
			results = data.results ?? [];
			open = results.length > 0;
		} catch {
			results = [];
		} finally {
			loading = false;
		}
	}

	function onInput(e: Event) {
		query = (e.target as HTMLInputElement).value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => search(query), 300);
	}

	function select(location: GeocodingResult) {
		selectedLocation.select(location);
		query = `${location.name}, ${location.admin1 ?? location.country}`;
		open = false;
		results = [];
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false;
			results = [];
		}
	}
</script>

<div class="relative w-full max-w-md">
	<input
		type="search"
		placeholder="Search city or town…"
		value={query}
		oninput={onInput}
		onkeydown={onKeydown}
		class="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm outline-none
		       focus:border-blue-400 focus:ring-2 focus:ring-blue-200
		       dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500"
	/>
	{#if loading}
		<span class="absolute right-3 top-2.5 text-gray-400 text-sm">…</span>
	{/if}
	{#if open}
		<ul
			class="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg
			       dark:border-gray-700 dark:bg-gray-800"
		>
			{#each results as loc (loc.id)}
				<li>
					<button
						type="button"
						onclick={() => select(loc)}
						class="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 dark:hover:bg-gray-700
						       dark:text-white first:rounded-t-xl last:rounded-b-xl"
					>
						{loc.name}{loc.admin1 ? `, ${loc.admin1}` : ''} &mdash; {loc.country}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
