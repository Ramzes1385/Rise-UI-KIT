import type { CustomClassProp } from '@composables/useCustomClass'
import type { CustomColor } from '@composables/useCustomColor'

/**
 * Ориентация разделителя
 */
export type SeparatorOrientation = 'horizontal' | 'vertical'

/**
 * Пропсы компонента BaseSeparator
 */
export interface BaseSeparatorProps {
	/** Ориентация */
	orientation?: SeparatorOrientation
	/** Текст метки между линиями */
	label?: string
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Толщина линии (px). По умолчанию 1 */
	thickness?: number
	/** Пунктирная линия */
	isDashed?: boolean
	/** Базовый padding (px). Y = значение, X = значение * 2. По умолчанию 10 → 10px 20px */
	spacing?: number
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Кастомные классы */
	customClass?: CustomClassProp
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
