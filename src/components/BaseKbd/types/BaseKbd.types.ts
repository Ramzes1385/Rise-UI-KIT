import type { BaseComponentProps } from '@composables/useBaseComponent'

/**
 * Варианты оформления:
 * default — фон bg-elevated, рамка и нижняя «грань» клавиши; outline — только рамка; soft — только фон; ghost — только текст
 */
export const KBD_VARIANTS = ['default', 'outline', 'soft', 'ghost'] as const

export interface BaseKbdProps extends BaseComponentProps<(typeof KBD_VARIANTS)[number], 'root'> {
	/**
	 * Клавиша: текст («K», «Ctrl») или имя служебной клавиши — `meta`, `ctrl`, `alt`, `shift`, `enter`, `backspace`,
	 * `delete`, `escape`, `tab`, `space`, `arrowup`, `arrowdown`, `arrowleft`, `arrowright`. Служебные показываются
	 * символом (⌘ ⇧ ↵ …) с названием для скринридера; `meta` и `alt` на macOS — ⌘ и ⌥, на остальных — Ctrl и Alt
	 */
	value?: string
	/** Платформа для служебных клавиш; по умолчанию определяется по браузеру */
	platform?: 'mac' | 'other'
}

export interface BaseKbdSlots {
	/** Своё содержимое клавиши вместо value */
	default?: () => unknown
}
