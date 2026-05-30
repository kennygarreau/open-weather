<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import { onMount, onDestroy } from 'svelte';
	import { theme } from '$lib/stores/theme';
	import type { Map as LeafletMap, TileLayer } from 'leaflet';
	import type leaflet from 'leaflet';

	interface Props {
		latitude: number;
		longitude: number;
	}

	let { latitude, longitude }: Props = $props();

	let mapEl: HTMLDivElement;
	let map: LeafletMap | null = null;
	let baseLayer: TileLayer | null = null;
	let radarLayer: TileLayer | null = null;
	let radarHost = '';
	let radarPath = '';
	let L: typeof leaflet | null = null;

	const OSM_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	const OSM_ATTR = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
	const CARTO_DARK_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
	const CARTO_ATTR = OSM_ATTR + ', © <a href="https://carto.com/">CARTO</a>';

	function radarTileUrl(dark: boolean): string {
		const color = dark ? 8 : 4;
		return `${radarHost}${radarPath}/256/{z}/{x}/{y}/${color}/1_1.png`;
	}

	onMount(async () => {
		L = (await import('leaflet')).default;
		const dark = $theme === 'dark';

		map = L.map(mapEl, { zoomControl: true, attributionControl: true }).setView(
			[latitude, longitude],
			7
		);

		baseLayer = L.tileLayer(dark ? CARTO_DARK_URL : OSM_URL, {
			attribution: dark ? CARTO_ATTR : OSM_ATTR,
			maxZoom: 19
		}).addTo(map);

		try {
			const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
			const data = await res.json();
			const frames: { time: number; path: string }[] = data.radar?.past ?? [];
			if (frames.length > 0) {
				const latest = frames[frames.length - 1];
				radarHost = data.host;
				radarPath = latest.path;
				radarLayer = L.tileLayer(radarTileUrl(dark), {
					opacity: 0.6,
					attribution: '© <a href="https://www.rainviewer.com">RainViewer</a>'
				}).addTo(map);
			}
		} catch {
			// Radar unavailable — base map still shown.
		}
	});

	onDestroy(() => {
		map?.remove();
	});

	$effect(() => {
		const lat = latitude;
		const lon = longitude;
		if (map) map.setView([lat, lon], map.getZoom());
	});

	$effect(() => {
		const dark = $theme === 'dark';
		if (!map || !L) return;

		baseLayer?.remove();
		baseLayer = L.tileLayer(dark ? CARTO_DARK_URL : OSM_URL, {
			attribution: dark ? CARTO_ATTR : OSM_ATTR,
			maxZoom: 19
		}).addTo(map);

		if (radarHost && radarPath) {
			radarLayer?.remove();
			radarLayer = L.tileLayer(radarTileUrl(dark), {
				opacity: 0.6,
				attribution: '© <a href="https://www.rainviewer.com">RainViewer</a>'
			}).addTo(map);
		}
	});
</script>

<div class="rounded-2xl bg-white/70 shadow-sm backdrop-blur dark:bg-gray-800/70 overflow-hidden">
	<div class="px-4 pt-4 pb-2">
		<h3 class="text-xs font-semibold uppercase tracking-wide text-gray-400">Radar</h3>
	</div>
	<div bind:this={mapEl} class="h-72 w-full"></div>
	<p class="px-4 py-1.5 text-right text-[10px] text-gray-400">
		Radar · RainViewer
	</p>
</div>
