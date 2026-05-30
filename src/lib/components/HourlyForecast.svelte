<script lang="ts">
	import WeatherIcon from '$lib/components/WeatherIcon.svelte';
	import type { HourlyWeatherData } from '$lib/api/types';

	interface Props {
		hourly: HourlyWeatherData;
		temperatureUnit: string;
		timeFormat: '12h' | '24h';
		cachedAt?: number | null;
	}

	let { hourly, temperatureUnit, timeFormat, cachedAt = null }: Props = $props();

	function formatCachedAt(ts: number): string {
		return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	const unitLabel = $derived(temperatureUnit === 'fahrenheit' ? '°F' : '°C');

	type View = '6h' | '24h';
	let view = $state<View>('6h');

	const now = new Date();
	const startIndex = $derived(
		Math.max(0, hourly.time.findIndex((t) => new Date(t) >= now))
	);

	const slots = $derived(
		view === '6h'
			? hourly.time.slice(startIndex, startIndex + 6)
			: hourly.time.slice(startIndex, startIndex + 24)
	);

	function formatHour(iso: string): string {
		const opts: Intl.DateTimeFormatOptions =
			timeFormat === '12h'
				? { hour: 'numeric', minute: '2-digit', hour12: true }
				: { hour: '2-digit', minute: '2-digit', hour12: false };
		return new Date(iso).toLocaleTimeString([], opts);
	}
</script>

<div class="rounded-2xl bg-white/70 p-4 shadow-sm backdrop-blur dark:bg-gray-800/70">
	<div class="mb-3 flex items-center justify-between">
		<div>
			<h3 class="text-xs font-semibold uppercase tracking-wide text-gray-400">Hourly Forecast</h3>
			<p class="text-[10px] text-gray-400">Open-Meteo{#if cachedAt} · as of {formatCachedAt(cachedAt)}{/if}</p>
		</div>
		<div class="flex rounded-lg bg-gray-100 p-0.5 dark:bg-gray-700">
			{#each (['6h', '24h'] as View[]) as v (v)}
				<button
					onclick={() => (view = v)}
					class="rounded-md px-3 py-1 text-xs font-medium transition-colors
					       {view === v
						? 'bg-white text-gray-800 shadow-sm dark:bg-gray-600 dark:text-white'
						: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}"
				>
					{v}
				</button>
			{/each}
		</div>
	</div>

	<div class="overflow-x-auto [scrollbar-width:thin] [scrollbar-color:#d1d5db_transparent] dark:[scrollbar-color:#4b5563_transparent]">
		<div class="flex gap-1 pb-1">
			{#each slots as time, i (time)}
				{@const idx = startIndex + i}
				<div class="flex flex-col items-center gap-0.5 text-gray-700 dark:text-gray-300 {view === '24h' ? 'w-14 shrink-0' : 'flex-1'}">
					<span class="text-xs text-gray-400 whitespace-nowrap">{formatHour(time)}</span>
					<WeatherIcon
						code={hourly.weather_code[idx]}
						isDay={hourly.is_day[idx] === 1}
						class="text-2xl"
					/>
					<span class="text-xs font-medium">{Math.round(hourly.temperature_2m[idx])}{unitLabel}</span>
					<span class="text-xs {hourly.precipitation_probability[idx] > 0 ? 'text-blue-400' : 'text-transparent'}">
						{hourly.precipitation_probability[idx]}%
					</span>
				</div>
			{/each}
		</div>
	</div>
</div>
