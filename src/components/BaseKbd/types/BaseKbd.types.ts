import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления:
 * default — фон bg-elevated, рамка и нижняя «грань» клавиши; outline — только рамка; soft — только фон; ghost — только текст
 */
export const KBD_VARIANTS = ['default', 'outline', 'soft', 'ghost'] as const

/**
 * Части клавиши для пропа `ui` (БЭМ-элементы `.base-kbd__<часть>`, `root` — сам `<kbd>`):
 * name — скрытое название служебной клавиши для скринридера (есть только у ⌘ ⇧ ↵ и других символов).
 */
export const KBD_PARTS = ['name'] as const

export type BaseKbdPart = (typeof KBD_PARTS)[number]

export interface BaseKbdProps extends BaseComponentProps<(typeof KBD_VARIANTS)[number], 'root'> {
	/**
	 * Клавиша: текст («K», «Ctrl») или имя служебной клавиши — `meta`, `ctrl`, `alt`, `shift`, `enter`, `backspace`,
	 * `delete`, `escape`, `tab`, `space`, `arrowup`, `arrowdown`, `arrowleft`, `arrowright`. Служебные показываются
	 * символом (⌘ ⇧ ↵ …) с названием для скринридера; `meta` и `alt` на macOS — ⌘ и ⌥, на остальных — Ctrl и Alt
	 */
	value?: string
	/** Платформа для служебных клавиш; по умолчанию определяется по браузеру */
	platform?: 'mac' | 'other'
	/**
	 * Классы частей клавиши (`root`, `name`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseKbd: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseKbd value="K" :ui="{ root: 'font-mono' }" />
	 */
	ui?: UiProp<BaseKbdPart>
}

export interface BaseKbdSlots {
	/** Своё содержимое клавиши вместо value */
	default?: () => unknown
}

export type KbdProps = PropsWithDefaults<BaseKbdProps, 'value'>

/** Название клавиши в словаре кита */
type KbdAriaKey =
	| 'KEY_COMMAND'
	| 'KEY_CONTROL'
	| 'KEY_OPTION'
	| 'KEY_SHIFT'
	| 'KEY_ENTER'
	| 'KEY_BACKSPACE'
	| 'KEY_DELETE'
	| 'KEY_UP'
	| 'KEY_DOWN'
	| 'KEY_LEFT'
	| 'KEY_RIGHT'

/** Символ клавиши и, у символов, ключ её названия */
export type KbdKeySpec = readonly [text: string, aria?: KbdAriaKey]

/** Показ клавиши: текст на экране и название для скринридера */
export interface KbdKeyLabel {
	text: string
	name?: string
}
