import type { BaseComponentProps } from '../../../types/base.types'

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
export interface BaseProgressProps extends BaseComponentProps<string, 'root' | 'track' | 'fill' | 'tooltipTrigger' | 'tooltipAnchor' | 'svg' | 'trackCircle' | 'fillCircle' | 'circleLabel'> {
	/** Значение (0–100) */
	value: number
	/** Максимальное значение */
	max?: number
	/** Форма */
	shape?: ProgressShape
	/** Анимация */
	animation?: ProgressAnimation
	/** Показывать значение */
	hasLabel?: boolean
	/** Неопределённый прогресс */
	isIndeterminate?: boolean
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
