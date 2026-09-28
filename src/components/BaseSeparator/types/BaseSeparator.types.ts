import type { BaseComponentProps } from '@composables/useBaseComponent'

/**
 * Ориентация разделителя
 */
export type SeparatorOrientation = 'horizontal' | 'vertical'

/**
 * Пропсы компонента BaseSeparator
 */
export interface BaseSeparatorProps extends BaseComponentProps<string, 'root' | 'line' | 'content'> {
	/** Ориентация: `horizontal` — линия во всю ширину, `vertical` — во всю высоту ряда. */
	orientation?: SeparatorOrientation
	/** Подпись между линиями. Она же — доступное имя разделителя (`aria-labelledby`). */
	label?: string
	/** Толщина линии (px). По умолчанию 1. */
	thickness?: number
	/** Пунктирная линия. */
	isDashed?: boolean
	/**
	 * Отступы вокруг подписи (px): вдоль линии — значение × 2, поперёк — значение. Например, 10 → 20px и 10px.
	 * Без пропа — из стилей: 12px вдоль линии, 0 поперёк.
	 */
	spacing?: number
}

/**
 * События компонента BaseSeparator (компонент не эмитит событий)
 */
export type BaseSeparatorEmits = Record<string, never>

/**
 * Слоты компонента BaseSeparator
 */
export interface BaseSeparatorSlots {
	/** Контент между линиями (текст, иконка, кастомный декоратор) */
	default?: () => unknown
}
