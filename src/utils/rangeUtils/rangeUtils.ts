/** Утилиты: расчёт позиции и привязка к шагу для range/slider компонентов */

import type { RangeScaleOptions, SnapToStepOptions } from './types/rangeUtils.types'

/** Максимальное число знаков, которое принимает Number.prototype.toFixed */
const MAX_FRACTION_DIGITS = 100

/** Рассчитать процент значения на шкале (0–100) */
function toPercent(options: RangeScaleOptions): number {
	const range = options.max - options.min
	if (range === 0) return 0
	return ((options.value - options.min) / range) * 100
}

/**
 * Количество знаков после запятой в записи числа (учитывает экспоненциальную форму, например 1e-7).
 * NaN и Infinity записываются без точки и экспоненты, поэтому дают 0 без отдельной проверки.
 */
function countDecimals(value: number): number {
	const [mantissa, exponent = '0'] = String(value).toLowerCase().split('e')
	const fractionLength = mantissa.split('.')[1]?.length ?? 0
	return Math.min(Math.max(fractionLength - Number(exponent), 0), MAX_FRACTION_DIGITS)
}

/** Привязать значение к ближайшему шагу в допустимом диапазоне */
function snapToStep(options: SnapToStepOptions): number {
	const steps = Math.round((options.value - options.min) / options.step)
	// min + steps * step даёт хвосты плавающей точки (3 * 0.1 = 0.30000000000000004),
	// которые попадают в v-model, подпись и aria-valuenow, — округляем до точности шага и минимума
	const precision = Math.max(countDecimals(options.step), countDecimals(options.min))
	const snapped = Number((options.min + steps * options.step).toFixed(precision))
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
