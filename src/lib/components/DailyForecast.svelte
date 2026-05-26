<script lang="ts">
	import { describeWeatherCode } from '$lib/api/weather';
	import WeatherIcon from '$lib/components/WeatherIcon.svelte';
	import type { DailyWeatherData } from '$lib/api/types';

	interface Props {
		daily: DailyWeatherData;
		temperatureUnit: string;
		timezone: string;
	}

	let { daily, temperatureUnit, timezone }: Props = $props();

	const unitLabel = $derived(temperatureUnit === 'fahrenheit' ? '°F' : '°C');

	// Today's date string (YYYY-MM-DD) in the location's own timezone.
	// Using 'en-CA' locale because it produces YYYY-MM-DD format natively.
	const todayStr = $derived(
		new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date())
	);

	// ISO date strings sort/compare correctly as plain strings — no Date parsing needed.
	const days = $derived(
		daily.time
			.map((t, i) => ({ t, i }))
			.filter(({ t }) => t >= todayStr)
	);

	const allMin = $derived(Math.min(...days.map(({ i }) => daily.temperature_2m_min[i])));
	const allMax = $derived(Math.max(...days.map(({ i }) => daily.temperature_2m_max[i])));
	const range = $derived(allMax - allMin || 1);

	function barStyle(i: number): string {
		const lo = ((daily.temperature_2m_min[i] - allMin) / range) * 100;
		const hi = ((daily.temperature_2m_max[i] - allMin) / range) * 100;
		return `left:${lo.toFixed(1)}%;right:${(100 - hi).toFixed(1)}%`;
	}

	function formatDay(t: string): string {
		if (t === todayStr) return 'Today';
		// Parse as local date components to avoid UTC-shift on display
		const [y, m, d] = t.split('-').map(Number);
		return new Date(y, m - 1, d).toLocaleDateString([], {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="rounded-2xl bg-white/70 p-4 shadow-sm backdrop-blur dark:bg-gray-800/70">
	<h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">7-Day Forecast</h3>
	<div class="flex flex-col divide-y divide-gray-100 dark:divide-gray-700">
		{#each days as { t, i } (i)}
			<div class="flex items-center gap-2 py-1.5 text-sm text-gray-700 dark:text-gray-300">
				<span class="w-24 shrink-0 truncate text-xs">{formatDay(t)}</span>

				<span title={describeWeatherCode(daily.weather_code[i])}>
					<WeatherIcon code={daily.weather_code[i]} class="shrink-0 text-2xl" />
				</span>

				<span class="w-8 shrink-0 text-right text-xs {daily.precipitation_probability_max[i] > 0 ? 'text-blue-400' : 'text-transparent'}">
					{daily.precipitation_probability_max[i]}%
				</span>

				<div class="relative mx-2 h-1.5 flex-1 rounded-full bg-gray-100 dark:bg-gray-700">
					<div
						class="absolute inset-y-0 rounded-full bg-gradient-to-r from-blue-400 to-amber-400"
						style={barStyle(i)}
					></div>
				</div>

				<div class="flex shrink-0 gap-1.5 font-medium tabular-nums">
					<span class="text-xs text-gray-400">{Math.round(daily.temperature_2m_min[i])}{unitLabel}</span>
					<span class="text-xs">{Math.round(daily.temperature_2m_max[i])}{unitLabel}</span>
				</div>
			</div>
		{/each}
	</div>
</div>
