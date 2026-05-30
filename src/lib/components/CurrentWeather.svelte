<script lang="ts">
	import { describeWeatherCode, tempUnitLabel, windUnitLabel, precipUnitLabel, windCardinal } from '$lib/api/weather';
	import WeatherIcon from '$lib/components/WeatherIcon.svelte';
	import { favorites } from '$lib/stores/favorites';
	import type { CurrentWeatherData, GeocodingResult } from '$lib/api/types';

	interface Props {
		current: CurrentWeatherData;
		location: GeocodingResult;
		temperatureUnit: string;
		windUnit: string;
		precipUnit: string;
	}

	let { current, location, temperatureUnit, windUnit, precipUnit }: Props = $props();

	const unitLabel = $derived(tempUnitLabel(temperatureUnit));
	const windLabel = $derived(windUnitLabel(windUnit));
	const precipLabel = $derived(precipUnitLabel(precipUnit));
	const isFavorite = $derived(favorites.has(location.id, $favorites));

	function toggleFavorite() {
		if (isFavorite) {
			favorites.remove(location.id);
		} else {
			favorites.add(location);
		}
	}
</script>

<div class="rounded-2xl bg-white/70 p-6 shadow-sm backdrop-blur dark:bg-gray-800/70">
	<div class="flex items-start justify-between">
		<div>
			<div class="flex items-center gap-2">
				<h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200">
					{location.name}{location.admin1 ? `, ${location.admin1}` : ''}
				</h2>
				<button
					onclick={toggleFavorite}
					aria-label="{isFavorite ? 'Remove from' : 'Add to'} favorites"
					title="{isFavorite ? 'Remove from' : 'Add to'} favorites"
					class="text-lg transition-transform hover:scale-110 active:scale-95"
				>
					{isFavorite ? '⭐' : '☆'}
				</button>
			</div>
			<p class="text-sm text-gray-400 dark:text-gray-500">{location.country}</p>
		</div>
		<WeatherIcon code={current.weather_code} isDay={current.is_day === 1} class="text-6xl" />
	</div>

	<div class="mt-4 flex items-end gap-4">
		<span class="text-6xl font-light text-gray-800 dark:text-white">
			{Math.round(current.temperature_2m)}{unitLabel}
		</span>
		<div class="mb-1 text-sm text-gray-500 dark:text-gray-400">
			<p>Feels like {Math.round(current.apparent_temperature)}{unitLabel}</p>
			<p>{describeWeatherCode(current.weather_code)}</p>
		</div>
	</div>

	<div class="mt-6 grid grid-cols-4 gap-4 text-center text-sm text-gray-600 dark:text-gray-400">
		<div>
			<p class="text-xs uppercase tracking-wide text-gray-400">Humidity</p>
			<p class="font-medium">{current.relative_humidity_2m}%</p>
		</div>
		<div>
			<p class="text-xs uppercase tracking-wide text-gray-400">Wind</p>
			<p class="font-medium">{Math.round(current.wind_speed_10m)} {windLabel} {windCardinal(current.wind_direction_10m)}</p>
		</div>
		<div>
			<p class="text-xs uppercase tracking-wide text-gray-400">Rain</p>
			<p class="font-medium">{current.precipitation} {precipLabel}</p>
		</div>
		<div>
			<p class="text-xs uppercase tracking-wide text-gray-400">UV Index</p>
			<p class="font-medium">{current.uv_index}</p>
		</div>
	</div>
</div>
