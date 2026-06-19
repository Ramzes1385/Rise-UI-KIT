/** Утилиты: расчёт значения рейтинга по позиции указателя */

/** Параметры расчёта значения по позиции указателя */
export interface PointerValueOptions {
	/** Индекс звезды (1..max) */
	star: number
	/** Доля позиции внутри звезды по горизонтали (0..1) */
	ratio: number
	/** Шаг округления оценки */
	step: number
	/** Максимальная оценка */
	max: number
}

/** Привязать оценку к ближайшему шагу в диапазоне [0, max] */
function snapRating(value: number, step: number, max: number): number {
	const steps = Math.round(value / step)
	const snapped = steps * step
	const clamped = Math.min(Math.max(snapped, 0), max)
	return Number(clamped.toFixed(4))
}

/** Рассчитать оценку по позиции указателя внутри звезды (округление вверх до шага) */
function valueFromPointer(options: PointerValueOptions): number {
	const ratio = Math.min(Math.max(options.ratio, 0), 1)
	const stepsInStar = Math.ceil(ratio / options.step)
	const inStar = Math.min(stepsInStar * options.step, 1)
	const raw = options.star - 1 + inStar
	const value = Math.min(Math.max(raw, options.step), options.max)
	return Number(value.toFixed(4))
}

/** Рассчитать непрерывную оценку по позиции указателя (без привязки к шагу) */
function rawValueFromPointer(star: number, ratio: number, max: number): number {
	const clampedRatio = Math.min(Math.max(ratio, 0), 1)
	const raw = star - 1 + clampedRatio
	const value = Math.min(Math.max(raw, 0), max)
	return Number(value.toFixed(4))
}

/** Рассчитать процент заливки конкретной звезды (0..100), округлённый */
function starFillPercent(star: number, value: number): number {
	const fill = value - (star - 1)
	const clamped = Math.min(Math.max(fill, 0), 1)
	return Math.round(clamped * 1000) / 10
}

export { rawValueFromPointer, snapRating, starFillPercent, valueFromPointer }
