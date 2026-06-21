import type { BaseComponentProps } from '../../../types/base.types'

/**
 * Ориентация разделителя
 */
export type SeparatorOrientation = 'horizontal' | 'vertical'

/**
 * Пропсы компонента BaseSeparator
 */
export interface BaseSeparatorProps extends BaseComponentProps<string, 'root' | 'line' | 'content'> {
	/** Ориентация */
	orientation?: SeparatorOrientation
	/** Текст метки между линиями */
	label?: string
	/** Толщина линии (px). По умолчанию 1 */
	thickness?: number
	/** Пунктирная линия */
	isDashed?: boolean
	/** Базовый padding (px). Y = значение, X = значение * 2. По умолчанию 10 → 10px 20px */
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
