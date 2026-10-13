import type { MapScheme } from '../types/BaseMap.types'
import type { MapResolvedScheme } from '../types/providers.types'
import { computed, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

const THEME_ATTRIBUTES = ['data-theme']
const DARK_QUERY = '(prefers-color-scheme: dark)'

function isDarkTheme(area: HTMLElement | null): boolean {
	const mode = (area?.closest('[data-theme]') ?? document.documentElement).getAttribute('data-theme')
	if (mode === 'dark') return true
	if (mode === 'light') return false
	return typeof window.matchMedia === 'function' && window.matchMedia(DARK_QUERY).matches
}

export function useMapScheme(scheme: () => MapScheme | undefined, area: Ref<HTMLElement | null>) {
	const isAutoDark = ref(false)
	let observer: MutationObserver | null = null
	let media: MediaQueryList | null = null

	const refresh = (): void => {
		isAutoDark.value = isDarkTheme(area.value)
	}

	onMounted(() => {
		refresh()
		observer = new MutationObserver(refresh)
		observer.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: THEME_ATTRIBUTES })
		media = typeof window.matchMedia === 'function' ? window.matchMedia(DARK_QUERY) : null
		media?.addEventListener('change', refresh)
	})

	onBeforeUnmount(() => {
		observer?.disconnect()
		media?.removeEventListener('change', refresh)
	})

	return computed<MapResolvedScheme>(() => {
		const value = scheme() ?? 'auto'
		if (value !== 'auto') return value
		return isAutoDark.value ? 'dark' : 'light'
	})
}
