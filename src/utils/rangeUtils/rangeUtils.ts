/** Утилиты: расчёт позиции и привязка к шагу для range/slider компонентов */

import type { RangeScaleOptions, SnapToStepOptions } from './rangeUtils.types'

/** Рассчитать процент значения на шкале (0–100) */
function toPercent(options: RangeScaleOptions): number {
	const range = options.max - options.min
	if (range === 0) return 0
	return ((options.value - options.min) / range) * 100
}

/** Привязать значение к ближайшему шагу в допустимом диапазоне */
function snapToStep(options: SnapToStepOptions): number {
	const steps = Math.round((options.value - options.min) / options.step)
	const snapped = options.min + steps * options.step
	return Math.min(Math.max(snapped, options.min), options.max)
}

/** Рассчитать CSS-стиль заливки трека (горизонтальный) */
function calcFillStyle(firstPercent: number, secondPercent?: number): Record<string, string> {
	if (secondPercent !== undefined) {
		return {
			left: `${firstPercent}%`,
			width: `${secondPercent - firstPercent}%`,
		}
	}
	return { left: '0', width: `${firstPercent}%` }
}

/** Рассчитать CSS-стиль позиции ползунка (горизонтальный) */
function calcThumbStyle(percent: number): Record<string, string> {
	return { left: `${percent}%` }
}

export { calcFillStyle, calcThumbStyle, snapToStep, toPercent }
