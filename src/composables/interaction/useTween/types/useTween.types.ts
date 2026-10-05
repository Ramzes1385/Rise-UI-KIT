import type { MaybeRefOrGetter, Ref, ShallowRef } from 'vue'
import type { MotionDuration } from '@composables/app/useMotion'

/** Значение твина: число или массив чисел одной длины */
export type TweenValue = number | readonly number[]

/** Кривая твина: прогресс `0…1` → доля пути `0…1` */
export type TweenEasing = (progress: number) => number

/** Идущий твин: откуда, куда, начало по `performance.now()` и длительность в мс */
export interface TweenRun<T extends TweenValue> {
	/** Начальное значение */
	from: T
	/** Конечное значение */
	to: T
	/** Время начала, мс */
	start: number
	/** Длительность, мс */
	length: number
}

/**
 * Опции composable useTween
 */
export interface UseTweenOptions<T extends TweenValue> {
	/** Начальное значение: при монтировании твин идёт от него к источнику (появление). Без него — сразу значение источника */
	from?: T
	/** Длительность по токену `--rise-duration*` (по умолчанию `xslow`) */
	duration?: MotionDuration
	/** Кривая (по умолчанию — замедление к концу, без перелёта) */
	easing?: TweenEasing
	/** Элемент, токены и пресет `data-rise-motion` которого определяют движение (по умолчанию — корень документа) */
	target?: MaybeRefOrGetter<Element | null | undefined>
	/** Анимировать изменения источника (по умолчанию `true`); `false` — новое значение сразу */
	enabled?: MaybeRefOrGetter<boolean>
}

/**
 * Результат composable useTween
 */
export interface UseTweenReturn<T extends TweenValue> {
	/** Текущее значение: на время твина — промежуточное */
	value: Readonly<ShallowRef<T>>
	/** Твин идёт */
	isRunning: Readonly<Ref<boolean>>
	/** Повторить переход к значению источника — от `from` (по умолчанию от `options.from`) */
	replay: (from?: T) => void
	/** Остановить твин на текущем значении */
	stop: () => void
}
