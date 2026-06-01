import type { CustomColor } from '@composables/useCustomColor'

/** Формы прогресс-бара */
export const PROGRESS_SHAPES = ['line', 'circle'] as const

/** Режимы анимации */
export const PROGRESS_ANIMATIONS = ['none', 'striped', 'pulse', 'glow'] as const

/**
 * Форма прогресс-бара
 */
export type ProgressShape = (typeof PROGRESS_SHAPES)[number]

/**
 * Режим анимации
 */
export type ProgressAnimation = (typeof PROGRESS_ANIMATIONS)[number]

/**
 * Пропсы компонента BaseProgress
 */
import type { CustomClassProp } from '@composables/useCustomClass'

export interface BaseProgressProps {
	/** Значение (0–100) */
	value: number
	/** Максимальное значение */
	max?: number
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Форма */
	shape?: ProgressShape
	/** Анимация */
	animation?: ProgressAnimation
	/** Показывать значение */
	hasLabel?: boolean
	/** Неопределённый прогресс */
	isIndeterminate?: boolean
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Кастомные классы */
	customClass?: CustomClassProp
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
