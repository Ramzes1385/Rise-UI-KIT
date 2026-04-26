import type { CustomColor } from '@/shared/composables/useCustomColor'

/** Варианты отображения прогресс-бара */
export const PROGRESS_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Вариант прогресс-бара
 */
export type ProgressVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'

/**
 * Форма прогресс-бара
 */
export type ProgressShape = 'line' | 'circle'

/**
 * Режим анимации
 */
export type ProgressAnimation = 'none' | 'striped' | 'pulse' | 'glow'

/**
 * Пропсы компонента BaseProgress
 */
export interface BaseProgressProps {
	/** Значение (0–100) */
	value: number
	/** Максимальное значение */
	max?: number
	/** Вариант отображения */
	variant?: (typeof PROGRESS_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Форма */
	shape?: ProgressShape
	/** Анимация */
	animation?: ProgressAnimation
	/** Показывать значение */
	hasLabel?: boolean
	/** Показывать значение внутри полосы */
	isIndeterminate?: boolean
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
}

/**
 * События компонента BaseProgress
 */
export interface BaseProgressEmits {
	(event: 'complete'): void
}

/**
 * Слоты компонента BaseProgress
 */
export interface BaseProgressSlots {
	default?: (props: { value: number; percent: number }) => unknown
}
