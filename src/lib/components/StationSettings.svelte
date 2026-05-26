<script lang="ts">
	import { stationStore } from '$lib/stores/stations';
	import type { StationConfig, StationFieldMap, StationObservation } from '$lib/api/types';

	const configs = stationStore.configs;
	const activeId = stationStore.activeId;

	// Form state for adding/editing a station
	let name = $state('');
	let url = $state('');
	let editingId = $state<string | null>(null);
	let showForm = $state(false);

	// Field map form (optional — only shown when the user expands "Advanced")
	let showFieldMap = $state(false);
	let fm = $state<StationFieldMap>({
		temperature: '',
		humidity: '',
		pressure: '',
		windSpeed: '',
		windDirection: '',
		precipitation: ''
	});

	// Test connection state
	let testResult = $state<{ obs: StationObservation; raw: unknown } | null>(null);
	let testError = $state<string | null>(null);
	let testing = $state(false);
	let rawExpanded = $state(false);

	function resetForm() {
		name = '';
		url = '';
		fm = { temperature: '', humidity: '', pressure: '', windSpeed: '', windDirection: '', precipitation: '' };
		editingId = null;
		showForm = false;
		showFieldMap = false;
		testResult = null;
		testError = null;
	}

	function startEdit(config: StationConfig) {
		name = config.name;
		url = config.url;
		fm = { ...config.fieldMap };
		editingId = config.id;
		showForm = true;
		showFieldMap = Object.values(config.fieldMap).some(Boolean);
		testResult = null;
		testError = null;
	}

	function cleanFieldMap(): StationFieldMap {
		return Object.fromEntries(
			Object.entries(fm).filter(([, v]) => v && v.trim())
		) as StationFieldMap;
	}

	function save() {
		if (!name.trim() || !url.trim()) return;
		const config: StationConfig = {
			id: editingId ?? crypto.randomUUID(),
			name: name.trim(),
			url: url.trim(),
			fieldMap: cleanFieldMap()
		};
		stationStore.addStation(config);
		resetForm();
	}

	async function testConnection() {
		if (!url.trim()) return;
		testing = true;
		testResult = null;
		testError = null;
		try {
			const result = await stationStore.testStation(url.trim(), cleanFieldMap());
			testResult = { obs: result.observation, raw: result.raw };
		} catch (e) {
			testError = e instanceof Error ? e.message : 'Connection failed';
		} finally {
			testing = false;
		}
	}

	const fieldLabels: { key: keyof StationFieldMap; label: string; placeholder: string }[] = [
		{ key: 'temperature', label: 'Temperature', placeholder: 'e.g. temp_f or data.temperature' },
		{ key: 'humidity', label: 'Humidity (%)', placeholder: 'e.g. humidity' },
		{ key: 'pressure', label: 'Pressure (hPa)', placeholder: 'e.g. baromrelin' },
		{ key: 'windSpeed', label: 'Wind speed', placeholder: 'e.g. windspeedmph' },
		{ key: 'windDirection', label: 'Wind direction (°)', placeholder: 'e.g. winddir' },
		{ key: 'precipitation', label: 'Precipitation', placeholder: 'e.g. dailyrainin' }
	];
</script>

<div class="flex flex-col gap-4">
	<div class="flex items-center justify-between">
		<h2 class="text-sm font-semibold text-gray-700 dark:text-gray-200">Weather Stations</h2>
		{#if !showForm}
			<button
				onclick={() => { showForm = true; }}
				class="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600"
			>
				+ Add station
			</button>
		{/if}
	</div>

	<!-- Station list -->
	{#if $configs.length === 0 && !showForm}
		<p class="text-center text-sm text-gray-400 dark:text-gray-600">No stations configured yet.</p>
	{/if}

	{#each $configs as config (config.id)}
		{@const isActive = $activeId === config.id}
		<div class="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
			<div class="flex-1 min-w-0">
				<p class="truncate text-sm font-medium text-gray-700 dark:text-gray-200">{config.name}</p>
				<p class="truncate text-xs text-gray-400">{config.url}</p>
			</div>
			<div class="flex shrink-0 gap-2">
				<button
					onclick={() => stationStore.setActive(isActive ? null : config.id)}
					class="rounded-lg px-2.5 py-1 text-xs font-medium transition-colors
					       {isActive
						? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
						: 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'}"
				>
					{isActive ? 'Active' : 'Use'}
				</button>
				<button
					onclick={() => startEdit(config)}
					class="rounded-lg px-2.5 py-1 text-xs text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
				>
					Edit
				</button>
				<button
					onclick={() => stationStore.removeStation(config.id)}
					class="rounded-lg px-2.5 py-1 text-xs text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
				>
					Remove
				</button>
			</div>
		</div>
	{/each}

	<!-- Add/Edit form -->
	{#if showForm}
		<div class="rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
			<h3 class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
				{editingId ? 'Edit station' : 'New station'}
			</h3>

			<div class="flex flex-col gap-3">
				<input
					type="text"
					placeholder="Station name"
					bind:value={name}
					class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm
					       dark:border-gray-700 dark:bg-gray-800 dark:text-white"
				/>
				<div class="flex gap-2">
					<input
						type="url"
						placeholder="JSON endpoint URL"
						bind:value={url}
						class="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm
						       dark:border-gray-700 dark:bg-gray-800 dark:text-white"
					/>
					<button
						onclick={testConnection}
						disabled={!url.trim() || testing}
						class="shrink-0 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600
						       hover:bg-gray-200 disabled:opacity-40 dark:bg-gray-700 dark:text-gray-300"
					>
						{testing ? 'Testing…' : 'Test'}
					</button>
				</div>

				<!-- Test result -->
				{#if testError}
					<p class="text-xs text-red-500">{testError}</p>
				{/if}
				{#if testResult}
					<div class="rounded-lg bg-green-50 p-3 text-xs dark:bg-green-900/20">
						<p class="font-medium text-green-700 dark:text-green-400">Connection OK</p>
						<div class="mt-1 grid grid-cols-3 gap-1 text-gray-600 dark:text-gray-400">
							{#each Object.entries(testResult.obs).filter(([k]) => k !== 'fetchedAt') as [k, v]}
								{#if v !== undefined}
									<span>{k}: <strong>{typeof v === 'number' ? v.toFixed(1) : v}</strong></span>
								{/if}
							{/each}
						</div>
						<button
							onclick={() => { rawExpanded = !rawExpanded; }}
							class="mt-2 text-gray-400 underline hover:text-gray-600"
						>
							{rawExpanded ? 'Hide' : 'Show'} raw JSON
						</button>
						{#if rawExpanded}
							<pre class="mt-2 max-h-48 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
{JSON.stringify(testResult.raw, null, 2)}</pre>
						{/if}
					</div>
				{/if}

				<!-- Field mapping -->
				<button
					onclick={() => { showFieldMap = !showFieldMap; }}
					class="text-left text-xs text-blue-500 hover:underline"
				>
					{showFieldMap ? '▾' : '▸'} Field mapping {showFieldMap ? '' : '(optional)'}
				</button>
				{#if showFieldMap}
					<div class="grid grid-cols-2 gap-2">
						{#each fieldLabels as { key, label, placeholder }}
							<div>
								<label for="fm-{key}" class="mb-0.5 block text-xs text-gray-500">{label}</label>
								<input
									id="fm-{key}"
									type="text"
									{placeholder}
									bind:value={fm[key]}
									class="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs
									       dark:border-gray-700 dark:bg-gray-800 dark:text-white"
								/>
							</div>
						{/each}
					</div>
					<p class="text-xs text-gray-400">
						Enter the JSON key from your station's response. Dot-notation works for nested values,
						e.g. <code class="rounded bg-gray-100 px-1 dark:bg-gray-700">sensors.temp_f</code>.
						Leave blank to fall back to Open-Meteo for that field.
					</p>
				{/if}

				<div class="flex gap-2 pt-1">
					<button
						onclick={save}
						disabled={!name.trim() || !url.trim()}
						class="rounded-lg bg-blue-500 px-4 py-1.5 text-xs font-medium text-white
						       hover:bg-blue-600 disabled:opacity-40"
					>
						{editingId ? 'Save changes' : 'Add station'}
					</button>
					<button
						onclick={resetForm}
						class="rounded-lg px-4 py-1.5 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
