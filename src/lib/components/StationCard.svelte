<script lang="ts">
	import { stationStore } from '$lib/stores/stations';
	import { describeWeatherCode, tempUnitLabel, windUnitLabel, precipUnitLabel, windCardinal } from '$lib/api/weather';
	import WeatherIcon from '$lib/components/WeatherIcon.svelte';
	import type { CurrentWeatherData, GeocodingResult } from '$lib/api/types';

	interface Props {
		/** Open-Meteo current data — used as fallback for fields the station doesn't provide. */
		omCurrent: CurrentWeatherData;
		location: GeocodingResult;
		temperatureUnit: string;
		windUnit: string;
		precipUnit: string;
	}

	let { omCurrent, location, temperatureUnit, windUnit, precipUnit }: Props = $props();

	const obs = stationStore.observation;
	const station = stationStore.activeStation;
	const err = stationStore.error;
	const isLoading = stationStore.loading;

	const unitLabel = $derived(tempUnitLabel(temperatureUnit));
	const windLabel = $derived(windUnitLabel(windUnit));
	const precipLabel = $derived(precipUnitLabel(precipUnit));

	// Use station value when available, fall back to Open-Meteo.
	const temperature = $derived($obs?.temperature ?? omCurrent.temperature_2m);
	const humidity = $derived($obs?.humidity ?? omCurrent.relative_humidity_2m);
	const windSpeed = $derived($obs?.windSpeed ?? omCurrent.wind_speed_10m);
	const precipitation = $derived($obs?.precipitation ?? omCurrent.precipitation);

	function formatTime(iso: string): string {
		return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
</script>

<div class="rounded-2xl bg-white/70 p-6 shadow-sm backdrop-blur dark:bg-gray-800/70">
	<div class="flex items-start justify-between">
		<div>
			<div class="flex items-center gap-2">
				<h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200">
					{location.name}{location.admin1 ? `, ${location.admin1}` : ''}
				</h2>
				<!-- Live badge -->
				<span class="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-400">
					<span class="relative flex h-1.5 w-1.5">
						<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
						<span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
					</span>
					Live · {$station?.name ?? 'Station'}
				</span>
			</div>
			<p class="text-sm text-gray-400 dark:text-gray-500">
				{location.country}
				{#if $obs}
					· Updated {formatTime($obs.fetchedAt)}
				{/if}
			</p>
		</div>
		<WeatherIcon code={omCurrent.weather_code} isDay={omCurrent.is_day === 1} class="text-6xl" />
	</div>

	{#if $err}
		<p class="mt-2 text-xs text-red-500">Station unreachable: {$err} — showing Open-Meteo data.</p>
	{/if}

	<div class="mt-4 flex items-end gap-4">
		<span class="text-6xl font-light text-gray-800 dark:text-white">
			{Math.round(temperature)}{unitLabel}
		</span>
		<div class="mb-1 text-sm text-gray-500 dark:text-gray-400">
			<p>Feels like {Math.round(omCurrent.apparent_temperature)}{unitLabel}</p>
			<p>{describeWeatherCode(omCurrent.weather_code)}</p>
		</div>
	</div>

	<div class="mt-6 grid grid-cols-4 gap-3 text-center text-sm text-gray-600 dark:text-gray-400">
		<div>
			<p class="text-xs uppercase tracking-wide text-gray-400">Humidity</p>
			<p class="font-medium">{Math.round(humidity)}%</p>
		</div>
		<div>
			<p class="text-xs uppercase tracking-wide text-gray-400">Wind</p>
			<p class="font-medium">{Math.round(windSpeed)} {windLabel} {windCardinal(omCurrent.wind_direction_10m)}</p>
		</div>
		<div>
			<p class="text-xs uppercase tracking-wide text-gray-400">Rain</p>
			<p class="font-medium">{precipitation.toFixed(1)} {precipLabel}</p>
		</div>
		{#if $obs?.pressure !== undefined}
			<div>
				<p class="text-xs uppercase tracking-wide text-gray-400">Pressure</p>
				<p class="font-medium">{$obs.pressure.toFixed(0)} hPa</p>
			</div>
		{:else}
			<div>
				<p class="text-xs uppercase tracking-wide text-gray-400">UV Index</p>
				<p class="font-medium">{omCurrent.uv_index}</p>
			</div>
		{/if}
	</div>

	{#if $isLoading && !$obs}
		<p class="mt-3 text-center text-xs text-gray-400">Connecting to station…</p>
	{/if}
</div>
