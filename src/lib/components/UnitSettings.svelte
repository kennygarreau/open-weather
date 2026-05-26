<script lang="ts">
	import { units } from '$lib/stores/units';

	type ToggleGroup<T extends string> = { label: string; value: T }[];

	const tempOptions: ToggleGroup<'celsius' | 'fahrenheit'> = [
		{ label: '°C', value: 'celsius' },
		{ label: '°F', value: 'fahrenheit' }
	];

	const windOptions: ToggleGroup<'kmh' | 'mph' | 'ms'> = [
		{ label: 'km/h', value: 'kmh' },
		{ label: 'mph', value: 'mph' },
		{ label: 'm/s', value: 'ms' }
	];

	const timeOptions: ToggleGroup<'12h' | '24h'> = [
		{ label: '12h', value: '12h' },
		{ label: '24h', value: '24h' }
	];
</script>

<div class="flex flex-wrap items-center justify-center gap-3">
	<!-- Temperature -->
	<div class="flex rounded-lg bg-gray-100 p-0.5 dark:bg-gray-800">
		{#each tempOptions as opt (opt.value)}
			<button
				onclick={() => units.set({ temperature: opt.value })}
				class="rounded-md px-3 py-1 text-xs font-medium transition-colors
				       {$units.temperature === opt.value
					? 'bg-white text-gray-800 shadow-sm dark:bg-gray-600 dark:text-white'
					: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}"
			>
				{opt.label}
			</button>
		{/each}
	</div>

	<!-- Wind speed -->
	<div class="flex rounded-lg bg-gray-100 p-0.5 dark:bg-gray-800">
		{#each windOptions as opt (opt.value)}
			<button
				onclick={() => units.set({ windSpeed: opt.value })}
				class="rounded-md px-3 py-1 text-xs font-medium transition-colors
				       {$units.windSpeed === opt.value
					? 'bg-white text-gray-800 shadow-sm dark:bg-gray-600 dark:text-white'
					: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}"
			>
				{opt.label}
			</button>
		{/each}
	</div>

	<!-- Time format -->
	<div class="flex rounded-lg bg-gray-100 p-0.5 dark:bg-gray-800">
		{#each timeOptions as opt (opt.value)}
			<button
				onclick={() => units.set({ timeFormat: opt.value })}
				class="rounded-md px-3 py-1 text-xs font-medium transition-colors
				       {$units.timeFormat === opt.value
					? 'bg-white text-gray-800 shadow-sm dark:bg-gray-600 dark:text-white'
					: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}"
			>
				{opt.label}
			</button>
		{/each}
	</div>
</div>
