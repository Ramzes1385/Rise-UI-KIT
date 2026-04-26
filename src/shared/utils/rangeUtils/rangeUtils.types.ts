/** Параметры для расчёта позиции на шкале */
interface RangeScaleOptions {
	/** Минимальное значение */
	min: number
	/** Максимальное значение */
	max: number
	/** Текущее значение */
	value: number
}

/** Параметры для привязки к шагу */
interface SnapToStepOptions {
	/** Значение для привязки */
	value: number
	/** Минимальное значение */
	min: number
	/** Максимальное значение */
	max: number
	/** Шаг */
	step: number
}

export type { RangeScaleOptions, SnapToStepOptions }
