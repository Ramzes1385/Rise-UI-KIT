import type { ComputedRef } from 'vue'

/** Имена длительностей движения: `base` — `--rise-duration`, остальные — `--rise-duration-<имя>` */
export const MOTION_DURATIONS = ['fast', 'base', 'slow', 'xslow'] as const

/** Длительность движения по токену `--rise-duration*` */
export type MotionDuration = (typeof MOTION_DURATIONS)[number]

/**
 * Результат composable useMotion
 */
export interface UseMotionReturn {
	/** Движение выключено: системная настройка «уменьшить движение» или пресет `data-rise-motion="none"` у элемента или предка */
	isReduced: ComputedRef<boolean>
	/** Длительность в миллисекундах из токена `--rise-duration*` элемента; `0` — когда движение выключено */
	duration: (name?: MotionDuration) => number
}
