import type { BaseComponentProps } from '@/types/base.types'

/**
 * Пропсы компонента BaseSkeleton
 */
export interface BaseSkeletonProps extends Omit<BaseComponentProps, 'color'> {
	/** Ширина (px или %) */
	width?: string | number
	/** Высота (px или %) */
	height?: string | number
	/** Форма */
	shape?: 'text' | 'circle' | 'rect'
	/** Анимация */
	isAnimated?: boolean
	/** Кастомный цвет фона */
	color?: string
	/** Пульсация */
	isPulse?: boolean
}

/**
 * События компонента BaseSkeleton
 */
export type BaseSkeletonEmits = Record<string, never>

/**
 * Слоты компонента BaseSkeleton
 */
export interface BaseSkeletonSlots {
	default?: () => unknown
}
