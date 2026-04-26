/** День недели: 0 = воскресенье, 1 = понедельник, ..., 6 = суббота */
type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** Параметры для сборки даты с временем */
interface BuildDateOptions {
	/** Исходная дата */
	date: Date
	/** Часы */
	hours: number
	/** Минуты */
	minutes: number
	/** Секунды */
	seconds: number
}

export type { BuildDateOptions, Weekday }
