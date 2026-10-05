import type { ComputedRef, MaybeRefOrGetter } from 'vue'

/** Пресеты движения: значение атрибута `data-rise-motion` и опции плагина `motion` */
export const MOTION_PRESETS = ['none', 'subtle', 'standard', 'expressive'] as const

/** Пресет движения: `none` — без анимаций, `subtle` — короче и без перелёта, `standard` — по умолчанию, `expressive` — дольше, с пружиной */
export type MotionPreset = (typeof MOTION_PRESETS)[number]

/** Режимы опции плагина `reducedMotion` */
export const REDUCED_MOTION_MODES = ['user', 'always'] as const

/**
 * `user` (по умолчанию) — системная настройка «уменьшить движение» главнее пресета; `always` — движение выключено всегда
 * (киоски, тесты). Отключить системную настройку нельзя (WCAG 2.3.3)
 */
export type ReducedMotionMode = (typeof REDUCED_MOTION_MODES)[number]

/** Длительности: `fast` — `--rise-duration-fast`, `base` — `--rise-duration`, `slow` — `--rise-duration-slow`, `xslow` — `--rise-duration-xslow` */
export const MOTION_DURATIONS = ['fast', 'base', 'slow', 'xslow'] as const

export type MotionDurationName = (typeof MOTION_DURATIONS)[number]

/** Кривые: `base` — `--rise-ease`, `out`, `in`, `emphasized`, `spring` — `--rise-ease-<имя>` */
export const MOTION_EASINGS = ['base', 'out', 'in', 'emphasized', 'spring'] as const

export type MotionEasingName = (typeof MOTION_EASINGS)[number]

/** Элемент, от которого читаются токены движения: ref, геттер или сам элемент; без него — `<html>` */
export type MotionTarget = MaybeRefOrGetter<Element | null | undefined>

export interface UseMotionReturn {
	/** Пресет ближайшего предка с `data-rise-motion` (или самого элемента); без атрибута — `standard` */
	preset: ComputedRef<MotionPreset>
	/** Движение выключено: системное «уменьшить движение», пресет `none` или `reducedMotion: 'always'` */
	isReduced: ComputedRef<boolean>
	/** Длительность токена в миллисекундах; при `isReduced` — `0`. По умолчанию — `base` (`--rise-duration`) */
	duration: (name?: MotionDurationName) => number
	/** Значение кривой из токена (`cubic-bezier(…)`, `linear(…)`) — для Web Animations API. По умолчанию — `base` */
	easing: (name?: MotionEasingName) => string
}
