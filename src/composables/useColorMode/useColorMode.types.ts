import type { COLOR_MODES } from './useColorMode'
import type { ComputedRef, Ref } from 'vue'

/** Режим темы: светлая, тёмная или как в системе */
export type ColorMode = (typeof COLOR_MODES)[number]

/** Тема, которая действует сейчас */
export type ResolvedColorMode = Exclude<ColorMode, 'system'>

/** Настройки `useColorMode()` и `createColorMode()` */
export interface ColorModeOptions {
	/** Элемент, которому ставится `data-theme`. По умолчанию `<html>` */
	target?: () => HTMLElement | null | undefined
	/** Ключ localStorage для выбора пользователя. `false` — не сохранять. По умолчанию `rise-color-mode` */
	storageKey?: string | false
	/** Режим, пока пользователь ничего не выбрал. По умолчанию `system` */
	initialMode?: ColorMode
}

/** Управление темой приложения */
export interface ColorModeController {
	/** Выбранный режим; присвоение меняет тему и сохраняет выбор */
	mode: Ref<ColorMode>
	/** Тема, которая действует сейчас: для `system` — по настройке системы */
	resolvedMode: ComputedRef<ResolvedColorMode>
	/** Тёмная ли тема сейчас */
	isDark: ComputedRef<boolean>
	/** Переключает светлую и тёмную тему; из `system` — на противоположную текущей */
	toggle: () => void
}

/** Экземпляр из `createColorMode()`: его можно остановить */
export interface ColorModeInstance extends ColorModeController {
	/** Снимает подписки на систему и на другие вкладки */
	stop: () => void
}
