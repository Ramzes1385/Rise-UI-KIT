/** Composable: темы кита — CSS темы в `<head>`, `data-rise-theme` на области и переключение в рантайме */
import { computed, readonly, ref, shallowRef } from 'vue'
import type { Theme, ThemePresetName } from '@utils/theme/themeUtils'
import { createTheme, THEME_PRESET_NAMES, THEME_PRESETS } from '@utils/theme/themeUtils'
import type { ApplyThemeOptions, ThemeController, ThemeControllerOptions } from './types/useTheme.types'

/** Атрибут `<style>` с CSS темы: значение — имя темы */
export const THEME_STYLE_ATTRIBUTE = 'data-rise-theme-style'

function themeStyle(theme: Theme, nonce: string | undefined): HTMLStyleElement {
	const selector = `style[${THEME_STYLE_ATTRIBUTE}="${theme.name}"]`
	let style = document.head.querySelector<HTMLStyleElement>(selector)
	if (!style) {
		style = document.createElement('style')
		style.setAttribute(THEME_STYLE_ATTRIBUTE, theme.name)
		document.head.append(style)
	}
	if (nonce) style.nonce = nonce
	return style
}

/** Режим области: ближайший `data-theme` выше по дереву, иначе `system` */
function inheritedMode(target: HTMLElement): string {
	return target.parentElement?.closest('[data-theme]')?.getAttribute('data-theme') ?? 'system'
}

/**
 * Подключает тему: `<style data-rise-theme-style>` в `<head>` (один на тему, с CSP nonce) и `data-rise-theme` на область
 * (по умолчанию `<html>`). Семантику кит пересчитывает на `[data-theme]`, поэтому у области без `data-theme` он ставится
 * унаследованным (ближайший выше или `system`). Без `document` (SSR) ничего не делает — CSS берётся из `theme.css`.
 *
 * @example
 * applyTheme(createTheme({ name: 'brand', primary: '#0f766e' }))
 * applyTheme(createTheme(THEME_PRESETS.playful), { target: promoSection })
 */
export function applyTheme(theme: Theme, options: ApplyThemeOptions = {}): void {
	if (typeof document === 'undefined') return
	themeStyle(theme, options.nonce).textContent = theme.css
	const target = options.target ?? document.documentElement
	target.setAttribute('data-rise-theme', theme.name)
	if (!target.hasAttribute('data-theme')) target.setAttribute('data-theme', inheritedMode(target))
}

function isPresetName(name: string): name is ThemePresetName {
	return (THEME_PRESET_NAMES as readonly string[]).includes(name)
}

/**
 * Создаёт отдельное управление темами. Для всего приложения используйте `useTheme()` — одно общее управление;
 * отдельное нужно для темы части интерфейса (`target`) и в тестах.
 */
export function createThemeController(options: ThemeControllerOptions = {}): ThemeController {
	const registered = shallowRef<Record<string, Theme>>({})
	const current = ref<string | null>(null)
	const settings = { nonce: options.nonce }

	function registerThemes(themes: Theme[]): void {
		registered.value = { ...registered.value, ...Object.fromEntries(themes.map(theme => [theme.name, theme])) }
	}

	function resolve(input: Theme | string): Theme | null {
		if (typeof input !== 'string') return input
		if (registered.value[input]) return registered.value[input]
		return isPresetName(input) ? createTheme(THEME_PRESETS[input]) : null
	}

	function setTheme(input: Theme | string): boolean {
		const theme = resolve(input)
		if (!theme) return false
		registerThemes([theme])
		applyTheme(theme, { target: options.target?.() ?? undefined, nonce: settings.nonce })
		current.value = theme.name
		return true
	}

	function configure(next: Pick<ThemeControllerOptions, 'themes' | 'nonce'>): void {
		registerThemes(next.themes ?? [])
		if (next.nonce) settings.nonce = next.nonce
	}

	configure(options)

	return {
		theme: readonly(current),
		themes: computed(() => [...new Set([...THEME_PRESET_NAMES, ...Object.keys(registered.value)])]),
		css: computed(() => (current.value ? registered.value[current.value].css : '')),
		setTheme,
		configure,
	}
}

let shared: ThemeController | null = null

/**
 * Тема приложения: одно общее управление. `setTheme('corporate')` подключает пресет, `setTheme(createTheme({…}))` —
 * свою тему; тема ставится на `<html>`. `themes` и `nonce` учитываются при каждом вызове, `target` — при первом. Опции плагина
 * `theme`, `themes`, `themeNonce` настраивают это же управление.
 *
 * @example
 * const { theme, themes, setTheme } = useTheme()
 * setTheme('playful')
 */
export function useTheme(options: ThemeControllerOptions = {}): ThemeController {
	shared ??= createThemeController(options)
	shared.configure(options)
	return shared
}
