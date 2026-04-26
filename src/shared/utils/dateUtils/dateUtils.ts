import type { BuildDateOptions } from './dateUtils.types'

/** Сравнить две даты без учёта времени */
function isSameDay(a: Date, b: Date): boolean {
	return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** Получить дату без времени (обнулить часы, минуты, секунды, мс) */
function toDateOnly(d: Date): Date {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/** Получить количество дней в месяце */
function daysInMonth(year: number, month: number): number {
	return new Date(year, month + 1, 0).getDate()
}

/** Получить день недели (0 = воскресенье) */
function getWeekday(date: Date): number {
	return date.getDay()
}

/** Получить номер недели по ISO 8601 */
function getWeekNumber(date: Date): number {
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
	const dayNum = d.getUTCDay() || 7
	d.setUTCDate(d.getUTCDate() + 4 - dayNum)
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
	return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/** Собрать новую дату с указанным временем */
function buildDateWithTime(options: BuildDateOptions): Date {
	return new Date(
		options.date.getFullYear(),
		options.date.getMonth(),
		options.date.getDate(),
		options.hours,
		options.minutes,
		options.seconds,
	)
}

/** Проверить, является ли дата сегодняшней */
function isToday(date: Date): boolean {
	return isSameDay(date, new Date())
}

/** Проверить, находится ли дата в диапазоне (исключая границы) */
function isDateInRange(date: Date, start: Date, end: Date): boolean {
	const d = toDateOnly(date)
	return d > toDateOnly(start) && d < toDateOnly(end)
}

export { buildDateWithTime, daysInMonth, getWeekday, getWeekNumber, isDateInRange, isSameDay, isToday, toDateOnly }
