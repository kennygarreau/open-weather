<script lang="ts">
	import UnitSettings from '$lib/components/UnitSettings.svelte';
	import StationSettings from '$lib/components/StationSettings.svelte';
</script>

<svelte:head>
	<title>Settings · Open Weather</title>
</svelte:head>

<div class="mt-8 flex flex-col gap-8">
	<section class="flex flex-col gap-3">
		<h2 class="text-xs font-semibold uppercase tracking-wide text-gray-400">Units</h2>
		<div class="rounded-2xl bg-white/70 p-5 shadow-sm backdrop-blur dark:bg-gray-800/70">
			<UnitSettings />
		</div>
	</section>

	<section class="flex flex-col gap-3">
		<h2 class="text-xs font-semibold uppercase tracking-wide text-gray-400">Local Weather Stations</h2>
		<div class="rounded-2xl bg-white/70 p-5 shadow-sm backdrop-blur dark:bg-gray-800/70">
			<StationSettings />
		</div>
	</section>
</div>
