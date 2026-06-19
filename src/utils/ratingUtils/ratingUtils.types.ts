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
