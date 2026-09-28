import type { PropsWithDefaults } from '@composables/useDefaults'
import type { BaseComponentProps } from '@composables/useBaseComponent'

export type SeparatorOrientation = 'horizontal' | 'vertical'

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

export interface BaseSeparatorSlots {
	/** Контент между линиями (текст, иконка, кастомный декоратор) */
	default?: () => unknown
}

export type SeparatorProps = PropsWithDefaults<BaseSeparatorProps, 'sizeScale'>
