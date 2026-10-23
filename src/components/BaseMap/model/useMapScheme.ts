import type { MapScheme } from '../types/BaseMap.types'
import { computed, onMounted, ref, type Ref } from 'vue'
import { usePageTheme } from '@composables/app/usePageTheme'
import type { MapResolvedScheme } from '../types/providers.types'

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

	const refresh = (): void => {
		isAutoDark.value = isDarkTheme(area.value)
	}

	onMounted(refresh)
	usePageTheme(refresh, THEME_ATTRIBUTES)

	return computed<MapResolvedScheme>(() => {
		const value = scheme() ?? 'auto'
		if (value !== 'auto') return value
		return isAutoDark.value ? 'dark' : 'light'
	})
}
