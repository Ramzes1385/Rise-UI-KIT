import type { CustomClassProp } from '@composables/useCustomClass'

/**
 * Пропсы компонента BaseSkeleton
 */
export interface BaseSkeletonProps {
	/** Кастомные классы */
	customClass?: CustomClassProp
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
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
}
