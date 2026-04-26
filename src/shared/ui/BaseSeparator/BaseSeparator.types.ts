import type { CustomColor } from '@/shared/composables/useCustomColor'

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
	/** Базовый padding (px). Y = значение, X = значение × 2. По умолчанию 10 → 10px 20px */
	spacing?: number
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
}

/**
 * События компонента BaseSeparator
 */
export interface BaseSeparatorEmits {}

/**
 * Слоты компонента BaseSeparator
 */
export interface BaseSeparatorSlots {
	/** Контент между линиями (текст, иконка, кастомный декоратор) */
	default?: () => unknown
}
