/** Composable: плавный переход числа или массива чисел к новому значению через requestAnimationFrame */

import type { MaybeRefOrGetter } from 'vue'
import { useMotion } from '@composables/app/useMotion'
import { canInterpolate, easeOutCubic, interpolateValue, isSameValue } from './tweenMath'
import type { TweenRun, TweenValue, UseTweenOptions, UseTweenReturn } from './types/useTween.types'
import { onBeforeUnmount, onMounted, readonly, ref, shallowReadonly, shallowRef, toValue, watch } from 'vue'

/**
 * Ведёт число или массив чисел к значению источника через `requestAnimationFrame`.
 * Длительность — из токена `--rise-duration*` (`useMotion`). Новое значение во время твина продолжает путь
 * с текущего промежуточного. Сразу конечное значение — при «уменьшить движение», пресете `none`, `enabled: false`,
 * нулевой длительности и массивах разной длины (интерполировать нечего).
 *
 * @example
 * ```ts
 * const { value } = useTween(() => props.total, { from: 0 })
 * ```
 */
export function useTween<T extends TweenValue>(source: MaybeRefOrGetter<T>, options: UseTweenOptions<T> = {}): UseTweenReturn<T> {
	const motion = useMotion(options.target)
	const easing = options.easing ?? easeOutCubic
	const value = shallowRef<T>(options.from ?? toValue(source))
	const isRunning = ref(false)
	let frame = 0

	function stop(): void {
		if (frame) cancelAnimationFrame(frame)
		frame = 0
		isRunning.value = false
	}

	function step(run: TweenRun<T>): void {
		const progress = Math.min(1, (performance.now() - run.start) / run.length)
		value.value = interpolateValue(run.from, run.to, easing(progress))
		if (progress < 1) frame = requestAnimationFrame(() => step(run))
		else stop()
	}

	function animate(to: T, from: T): void {
		const length = motion.duration(options.duration ?? 'xslow')
		const isEnabled = toValue(options.enabled) ?? true
		stop()
		if (!isEnabled || length === 0 || !canInterpolate(from, to) || isSameValue(from, to)) {
			value.value = to
			return
		}
		const run: TweenRun<T> = { from, to, start: performance.now(), length }
		value.value = from
		isRunning.value = true
		frame = requestAnimationFrame(() => step(run))
	}

	watch(
		() => toValue(source),
		to => animate(to, value.value),
	)

	onMounted(() => {
		if (options.from !== undefined) animate(toValue(source), options.from)
	})

	onBeforeUnmount(stop)

	return {
		value: shallowReadonly(value),
		isRunning: readonly(isRunning),
		replay: (from?: T) => animate(toValue(source), from ?? options.from ?? value.value),
		stop,
	}
}
