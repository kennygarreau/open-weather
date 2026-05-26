<script lang="ts">
	import { selectedLocation } from '$lib/stores/location';
	import { units } from '$lib/stores/units';
	import { stationStore } from '$lib/stores/stations';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import CurrentWeather from '$lib/components/CurrentWeather.svelte';
	import StationCard from '$lib/components/StationCard.svelte';
	import HourlyForecast from '$lib/components/HourlyForecast.svelte';
	import DailyForecast from '$lib/components/DailyForecast.svelte';
	import FavoriteLocations from '$lib/components/FavoriteLocations.svelte';
	import type { WeatherResponse } from '$lib/api/types';
	import type { UnitPreferences } from '$lib/stores/units';

	let weather = $state<WeatherResponse | null>(null);
	let loading = $state(false);
	let cachedAt = $state<number | null>(null);
	let err = $state<string | null>(null);

	const activeStation = stationStore.activeStation;
	const hasStation = $derived(!!$activeStation);

	// ── Client-side cache ──────────────────────────────────────────────────────
	const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

	interface CacheEntry {
		weather: WeatherResponse;
		at: number;
	}

	function cacheKey(locId: number, u: UnitPreferences): string {
		return `wx_${locId}_${u.temperature}_${u.windSpeed}_${u.precipitation}`;
	}

	function readCache(key: string): CacheEntry | null {
		if (typeof localStorage === 'undefined') return null;
		try {
			const raw = localStorage.getItem(key);
			return raw ? (JSON.parse(raw) as CacheEntry) : null;
		} catch {
			return null;
		}
	}

	function writeCache(key: string, data: WeatherResponse): void {
		if (typeof localStorage === 'undefined') return;
		try {
			localStorage.setItem(key, JSON.stringify({ weather: data, at: Date.now() }));
		} catch {
			// Ignore quota errors — cache is best-effort.
		}
	}

	// ── Weather fetch ──────────────────────────────────────────────────────────
	async function loadWeather(lat: number, lon: number, timezone: string, locId: number) {
		const u = $units;
		const key = cacheKey(locId, u);
		const cached = readCache(key);

		if (cached) {
			// Render cached data immediately regardless of staleness.
			weather = cached.weather;
			cachedAt = cached.at;
			// If fresh, we're done — no network call.
			if (Date.now() - cached.at < CACHE_TTL_MS) return;
		} else {
			loading = true;
		}

		// Fetch fresh data (silently in background if we already showed cached).
		err = null;
		try {
			const params = new URLSearchParams({
				latitude: String(lat),
				longitude: String(lon),
				current: [
					'temperature_2m',
					'relative_humidity_2m',
					'apparent_temperature',
					'precipitation',
					'weather_code',
					'wind_speed_10m',
					'wind_direction_10m',
					'is_day'
				].join(','),
				hourly: [
					'temperature_2m',
					'relative_humidity_2m',
					'precipitation_probability',
					'weather_code',
					'wind_speed_10m',
					'is_day'
				].join(','),
				daily: [
					'weather_code',
					'temperature_2m_max',
					'temperature_2m_min',
					'precipitation_sum',
					'precipitation_probability_max',
					'wind_speed_10m_max',
					'sunrise',
					'sunset'
				].join(','),
				temperature_unit: u.temperature,
				wind_speed_unit: u.windSpeed,
				precipitation_unit: u.precipitation,
				timezone,
				forecast_days: '7'
			});

			const res = await fetch(`/api/weather?${params}`);
			if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
			const fresh: WeatherResponse = await res.json();
			weather = fresh;
			cachedAt = Date.now();
			writeCache(key, fresh);
		} catch (e) {
			// Only surface the error if we have nothing to show.
			if (!weather) err = e instanceof Error ? e.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		const loc = $selectedLocation;
		void $units;
		if (loc) loadWeather(loc.latitude, loc.longitude, loc.timezone, loc.id);
	});

	function formatCachedAt(ts: number): string {
		return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
</script>

<svelte:head>
	<title>Open Weather</title>
</svelte:head>

<div class="mt-8 flex flex-col gap-6">
	<FavoriteLocations />

	<div class="flex justify-center">
		<SearchBar />
	</div>

	{#if !$selectedLocation && !loading}
		<p class="text-center text-gray-400 dark:text-gray-600">Search for a city to see the weather.</p>
	{/if}

	{#if loading}
		<p class="text-center text-gray-400 dark:text-gray-500">Loading…</p>
	{/if}

	{#if err}
		<p class="text-center text-red-500">{err}</p>
	{/if}

	{#if weather && $selectedLocation && !loading}
		<!-- Current conditions: station (live) or Open-Meteo -->
		{#if hasStation}
			<StationCard
				omCurrent={weather.current}
				location={$selectedLocation}
				temperatureUnit={$units.temperature}
				windUnit={$units.windSpeed}
			/>
		{:else}
			<CurrentWeather
				current={weather.current}
				location={$selectedLocation}
				temperatureUnit={$units.temperature}
				windUnit={$units.windSpeed}
			/>
		{/if}

		<!-- Forecast always comes from Open-Meteo -->
		<div class="flex items-center gap-2">
			<span class="text-xs text-gray-400">
				Forecast · Open-Meteo
				{#if cachedAt}
					· as of {formatCachedAt(cachedAt)}
				{/if}
			</span>
			<div class="h-px flex-1 bg-gray-100 dark:bg-gray-800"></div>
		</div>

		<HourlyForecast
			hourly={weather.hourly}
			temperatureUnit={$units.temperature}
			timeFormat={$units.timeFormat}
		/>
		<DailyForecast
			daily={weather.daily}
			temperatureUnit={$units.temperature}
			timezone={weather.timezone}
		/>
	{/if}
</div>
