/** Утилиты: интерполяция значений твина — числа и массивы чисел одной длины */

import type { TweenValue } from './types/useTween.types'

function lerp(from: number, to: number, progress: number): number {
	if (!Number.isFinite(from) || !Number.isFinite(to)) return to
	return from + (to - from) * progress
}

/** Замедление к концу без перелёта: быстрый старт, мягкая остановка */
export function easeOutCubic(progress: number): number {
	return 1 - (1 - progress) ** 3
}

/** Значения можно интерполировать: два числа или два массива одной длины */
export function canInterpolate(from: TweenValue, to: TweenValue): boolean {
	if (typeof from === 'number' || typeof to === 'number') return typeof from === typeof to
	return from.length === to.length
}

/** Значения совпадают поэлементно */
export function isSameValue(from: TweenValue, to: TweenValue): boolean {
	if (typeof from === 'number' || typeof to === 'number') return Object.is(from, to)
	return from.length === to.length && from.every((item, index) => Object.is(item, to[index]))
}

/** Промежуточное значение на доле пути `progress`; нечисловые точки (пропуски) сразу принимают конечное значение */
export function interpolateValue<T extends TweenValue>(from: T, to: T, progress: number): T {
	if (typeof from === 'number' || typeof to === 'number') return lerp(from as number, to as number, progress) as T
	return to.map((item, index) => lerp(from[index], item, progress)) as unknown as T
}
