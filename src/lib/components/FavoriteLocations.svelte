<script lang="ts">
	import { favorites } from '$lib/stores/favorites';
	import { selectedLocation } from '$lib/stores/location';
	import type { GeocodingResult } from '$lib/api/types';

	function select(loc: GeocodingResult) {
		selectedLocation.select(loc);
	}

	function remove(e: MouseEvent, id: number) {
		e.stopPropagation();
		favorites.remove(id);
	}
</script>

{#if $favorites.length > 0}
	<div class="flex flex-wrap justify-center gap-2">
		{#each $favorites as loc (loc.id)}
			{@const active = $selectedLocation?.id === loc.id}
			<button
				onclick={() => select(loc)}
				class="group flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors
				       {active
					? 'border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-300'
					: 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}"
			>
				<span>⭐</span>
				<span>{loc.name}{loc.admin1 ? `, ${loc.admin1}` : ''}</span>
				<span
					role="button"
					tabindex="0"
					aria-label="Remove {loc.name} from favorites"
					onclick={(e) => remove(e, loc.id)}
					onkeydown={(e) => e.key === 'Enter' && remove(e as unknown as MouseEvent, loc.id)}
					class="ml-0.5 text-gray-300 hover:text-red-400 dark:text-gray-600 dark:hover:text-red-400"
				>✕</span>
			</button>
		{/each}
	</div>
{/if}
