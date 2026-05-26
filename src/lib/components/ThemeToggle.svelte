<script lang="ts">
	import { theme } from '$lib/stores/theme';
</script>

<button
	onclick={() => theme.toggle()}
	aria-label="Toggle light/dark mode"
	class="rounded-full p-2 text-xl transition-colors hover:bg-black/10 dark:hover:bg-white/10"
>
	{$theme === 'dark' ? '☀️' : '🌙'}
</button>
