<script lang="ts">
	import Icon, { addCollection } from '@iconify/svelte';
	import { icons } from '@iconify-json/wi';

	addCollection(icons);

	interface Props {
		code: number;
		isDay?: boolean;
		class?: string;
	}

	let { code, isDay = true, class: cls = 'text-4xl' }: Props = $props();

	// Maps WMO weather codes to wi icon names.
	// Day/night variants are used where the icon set provides them.
	function iconName(c: number, day: boolean): string {
		const d = day ? 'day' : 'night-alt';
		if (c === 0)  return day ? 'wi:day-sunny' : 'wi:night-clear';
		if (c <= 2)   return `wi:${d}-cloudy`;
		if (c === 3)  return 'wi:cloudy';
		if (c <= 48)  return 'wi:fog';
		if (c <= 55)  return `wi:${d}-sprinkle`;
		if (c <= 65)  return `wi:${d}-rain`;
		if (c <= 77)  return `wi:${d}-snow`;
		if (c <= 82)  return `wi:${d}-showers`;
		if (c <= 86)  return `wi:${d}-snow`;
		return 'wi:thunderstorm';
	}
</script>

<Icon icon={iconName(code, isDay)} class={cls} />
