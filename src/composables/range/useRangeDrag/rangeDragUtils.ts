/** Утилиты: положение указателя на треке range-слайдера, ближайший ползунок и значение по клавише */
import type { RangeKeyBounds } from './types/useRangeDrag.types'

/** Описание: доля трека под указателем, 0…1; у вертикального трека 0 — внизу, у горизонтального в RTL — справа */
function trackRatio(event: MouseEvent | TouchEvent, rect: DOMRect, options: { isVertical: boolean; isRtl?: boolean }): number {
	const point = 'touches' in event ? event.touches[0] : event
	const along = options.isRtl ? (rect.right - point.clientX) / rect.width : (point.clientX - rect.left) / rect.width
	const ratio = options.isVertical ? 1 - (point.clientY - rect.top) / rect.height : along
	return Math.max(0, Math.min(1, ratio))
}

/** Описание: индекс ближайшей к значению точки; при равном расстоянии — первая из них */
function nearestIndex(values: number[], value: number): number {
	let best = 0
	let bestDistance = Math.abs(value - values[0])
	for (let i = 1; i < values.length; i += 1) {
		const distance = Math.abs(value - values[i])
		if (distance < bestDistance) {
			best = i
			bestDistance = distance
		}
	}
	return best
}

/** Крупный шаг PageUp/PageDown — в шагах `step` (APG Slider: «на величину больше шага») */
const PAGE_STEPS = 10

/** Сдвиг значения по клавише в шагах: стрелки — ±1, PageUp/PageDown — ±PAGE_STEPS */
const KEY_STEPS: Record<string, number> = {
	ArrowRight: 1,
	ArrowUp: 1,
	ArrowLeft: -1,
	ArrowDown: -1,
	PageUp: PAGE_STEPS,
	PageDown: -PAGE_STEPS,
}

/**
 * Описание: значение после клавиши по APG Slider: стрелки — на шаг, PageUp/PageDown — на 10 шагов,
 * Home и End — к границам `min` и `max`; другая клавиша — `null`
 */
function keyTarget(key: string, value: number, bounds: RangeKeyBounds): number | null {
	if (key === 'Home') return bounds.min
	if (key === 'End') return bounds.max
	const steps = KEY_STEPS[key]
	if (steps === undefined) return null
	return value + steps * bounds.step
}

export { keyTarget, nearestIndex, trackRatio }
