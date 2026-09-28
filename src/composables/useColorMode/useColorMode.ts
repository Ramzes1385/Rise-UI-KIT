/** Composable: светлая, тёмная или системная тема приложения */
import { computed, effectScope, ref, watch } from 'vue'
import type { ColorMode, ColorModeController, ColorModeInstance, ColorModeOptions, ResolvedColorMode } from './types/useColorMode.types'

export const COLOR_MODES = ['light', 'dark', 'system'] as const

export const COLOR_MODE_STORAGE_KEY = 'rise-color-mode'

const DARK_QUERY = '(prefers-color-scheme: dark)'

function isColorMode(value: unknown): value is ColorMode {
	return typeof value === 'string' && (COLOR_MODES as readonly string[]).includes(value)
}

/** Сохранённый режим. localStorage может быть недоступен (приватный режим, запрет сайта) */
function readStored(key: string | false): ColorMode | null {
	if (!key || typeof localStorage === 'undefined') return null
	try {
		const value = localStorage.getItem(key)
		return isColorMode(value) ? value : null
	} catch {
		return null
	}
}

function writeStored(key: string | false, value: ColorMode): void {
	if (!key || typeof localStorage === 'undefined') return
	try {
		localStorage.setItem(key, value)
	} catch {
		// Выбор действует до перезагрузки страницы
	}
}

/**
 * Создаёт отдельное управление темой. Для всего приложения используйте `useColorMode()`:
 * он возвращает одно общее управление. Отдельное нужно для темы части интерфейса (`target`) и в тестах.
 */
export function createColorMode(options: ColorModeOptions = {}): ColorModeInstance {
	const storageKey = options.storageKey ?? COLOR_MODE_STORAGE_KEY
	const hasWindow = typeof window !== 'undefined'
	const media = hasWindow && typeof window.matchMedia === 'function' ? window.matchMedia(DARK_QUERY) : null

	const isSystemDark = ref(media?.matches ?? false)
	const mode = ref<ColorMode>(readStored(storageKey) ?? options.initialMode ?? 'system')
	const resolvedMode = computed<ResolvedColorMode>(() => {
		if (mode.value !== 'system') return mode.value
		return isSystemDark.value ? 'dark' : 'light'
	})

	/** Элемент с атрибутом темы: из опций или `<html>`; без window — нет */
	function resolveTarget(): HTMLElement | null | undefined {
		if (options.target) return options.target()
		return hasWindow ? document.documentElement : null
	}

	function apply(value: ColorMode): void {
		// data-theme="system" переключает токены сам (CSS prefers-color-scheme): тема верна и до загрузки скриптов
		resolveTarget()?.setAttribute('data-theme', value)
	}

	function handleSystemChange(event: MediaQueryListEvent): void {
		isSystemDark.value = event.matches
	}

	/** Выбор в другой вкладке */
	function handleStorage(event: StorageEvent): void {
		if (event.key === storageKey && isColorMode(event.newValue)) mode.value = event.newValue
	}

	apply(mode.value)
	media?.addEventListener('change', handleSystemChange)
	if (hasWindow && storageKey) window.addEventListener('storage', handleStorage)

	const stopWatch = watch(mode, value => {
		apply(value)
		writeStored(storageKey, value)
	})

	function toggle(): void {
		mode.value = resolvedMode.value === 'dark' ? 'light' : 'dark'
	}

	function stop(): void {
		stopWatch()
		media?.removeEventListener('change', handleSystemChange)
		if (hasWindow) window.removeEventListener('storage', handleStorage)
	}

	return { mode, resolvedMode, isDark: computed(() => resolvedMode.value === 'dark'), toggle, stop }
}

let shared: ColorModeController | null = null

/**
 * Тема приложения: одно общее управление для всех компонентов. Ставит `data-theme` на `<html>`,
 * запоминает выбор в localStorage и следит за темой системы в режиме `system`.
 * Настройки учитываются при первом вызове — дальше возвращается то же управление.
 *
 * @example
 * const { mode, isDark, toggle } = useColorMode()
 * mode.value = 'system'
 */
export function useColorMode(options?: ColorModeOptions): ColorModeController {
	// Отдельная область эффектов: наблюдатель не остановится вместе с компонентом, который вызвал useColorMode первым
	shared ??= effectScope(true).run(() => createColorMode(options))!
	return shared
}
