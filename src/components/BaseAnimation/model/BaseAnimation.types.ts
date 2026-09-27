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

export interface BaseAnimationProps extends BaseComponentProps<string, 'root'> {
	/** Показывать содержимое. Переключение запускает анимацию появления или исчезновения. По умолчанию `true`. */
	show?: boolean
	/**
	 * Анимация: `fade`, `slide-up`/`-down`/`-left`/`-right`, `scale`, `bounce`, `rotate`, `flip`, `zoom`, `collapse`;
	 * `list` — для списков (`isGroup`). Длительности — из токенов `--rise-duration*`, при prefers-reduced-motion переход мгновенный.
	 */
	name?: TransitionName
	/**
	 * Порядок смены старого и нового содержимого (`mode` у Transition): `out-in` — сначала исчезает старое.
	 * Имеет значение, когда `show` переключают, пока ещё идёт анимация.
	 */
	mode?: (typeof ANIMATION_MODES)[number]
	/** Режим списка (TransitionGroup): каждый дочерний элемент анимируется отдельно и должен иметь `key`. */
	isGroup?: boolean
	/** Тег контейнера списка в режиме `isGroup`: `div`, `ul`, `ol`… */
	tag?: string
}

/**
 * События компонента BaseAnimation
 */
export interface BaseAnimationEmits {
	/** Анимация появления завершилась (в режиме `isGroup` — для каждого элемента списка). */
	(event: 'after-enter'): void
	/** Анимация исчезновения завершилась (в режиме `isGroup` — для каждого элемента списка). */
	(event: 'after-leave'): void
}

/**
 * Слоты компонента BaseAnimation
 */
export interface BaseAnimationSlots {
	/** Анимируемое содержимое; в режиме `isGroup` — элементы списка с `key`. */
	default?: () => unknown
}
