/** Доступные типы анимаций */
export const ANIMATION_NAMES = [
	'fade',
	'slide-up',
	'slide-down',
	'slide-left',
	'slide-right',
	'scale',
	'bounce',
	'rotate',
	'flip',
	'zoom',
	'collapse',
	'list',
] as const

/** Режимы анимации */
export const ANIMATION_MODES = ['out-in', 'in-out', 'default'] as const

/** Тип имени анимации */
export type TransitionName = (typeof ANIMATION_NAMES)[number]

import type { BaseComponentProps } from '../../../types/base.types'

export interface BaseAnimationProps extends BaseComponentProps {
	show?: boolean
	name?: TransitionName
	mode?: (typeof ANIMATION_MODES)[number]
	isGroup?: boolean
	tag?: string
}

/**
 * События компонента BaseAnimation
 */
export interface BaseAnimationEmits {
	/** Событие после завершения анимации появления */
	(event: 'after-enter'): void
	/** Событие после завершения анимации исчезновения */
	(event: 'after-leave'): void
}

/**
 * Слоты компонента BaseAnimation
 */
export interface BaseAnimationSlots {
	/** Контент для анимации */
	default?: () => unknown
}
