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

/**
 * Пропсы компонента BaseAnimation
 */
export interface BaseAnimationProps {
	/** Управление видимостью контента */
	show?: boolean
	/** Имя анимации */
	name?: TransitionName
	/** Режим анимации (только для обычного Transition) */
	mode?: (typeof ANIMATION_MODES)[number]
	/** Использовать TransitionGroup для списков */
	isGroup?: boolean
	/** HTML-тег для TransitionGroup */
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
