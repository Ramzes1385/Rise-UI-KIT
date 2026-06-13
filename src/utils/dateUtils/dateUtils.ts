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

/** Поддерживаемые форматы даты */
export const DATE_FORMATS = ['dd.MM.yyyy', 'dd.MM.yyyy HH:mm', 'dd.MM.yyyy HH:mm:ss'] as const

/** Тип формата даты */
export type DateFormat = (typeof DATE_FORMATS)[number]

/** Параметры форматирования одиночной даты */
export interface FormatDateOptions {
	date: Date
	dateFormat: DateFormat
	showTime: boolean
	showSeconds: boolean
	is24Hour: boolean
	locale: string
}

/** Параметры форматирования диапазона */
export interface FormatRangeOptions {
	start: Date | null
	end: Date | null
	dateFormat: DateFormat
	showTime: boolean
	showSeconds: boolean
	is24Hour: boolean
	locale: string
}

/** Параметры форматирования множественного выбора */
export interface FormatMultipleOptions {
	dates: Date[]
	dateFormat: DateFormat
	showTime: boolean
	showSeconds: boolean
	is24Hour: boolean
	locale: string
}

/** Режим выбора значения date picker */
export type DatePickerSelectionMode = 'single' | 'range' | 'multiple'

/** Параметры форматирования значения date picker */
export interface FormatDatePickerValueOptions {
	selectionMode: DatePickerSelectionMode
	date: Date | null
	endDate: Date | null
	dates: Date[]
	dateFormat: DateFormat
	showTime: boolean
	showSeconds: boolean
	is24Hour: boolean
	locale: string
}

/** Параметры форматирования даты для popover календаря */
export interface FormatPopoverDateOptions {
	date: Date
	locale: string
}

/** Форматировать одну дату в строку */
function formatDate(options: FormatDateOptions): string {
	const { date, showTime, showSeconds, is24Hour, locale } = options

	if (showTime) {
		return date.toLocaleString(locale, {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			...(showSeconds ? { second: '2-digit' } : {}),
			hour12: !is24Hour,
		})
	}

	return date.toLocaleDateString(locale, {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	})
}

/** Форматировать диапазон дат */
function formatRange(options: FormatRangeOptions): string {
	const { start, end, dateFormat, showTime, showSeconds, is24Hour, locale } = options
	const baseOpts = { dateFormat, showTime, showSeconds, is24Hour, locale }

	const startStr = start ? formatDate({ ...baseOpts, date: start }) : ''
	const endStr = end ? formatDate({ ...baseOpts, date: end }) : ''

	if (!startStr && !endStr) return ''
	if (!endStr) return `${startStr} — ...`
	return `${startStr} — ${endStr}`
}

/** Форматировать множественный выбор дат */
function formatMultiple(options: FormatMultipleOptions): string {
	const { dates, dateFormat, showTime, showSeconds, is24Hour, locale } = options
	if (dates.length === 0) return ''

	const baseOpts = { dateFormat, showTime, showSeconds, is24Hour, locale }

	if (dates.length <= 3) {
		return dates.map(d => formatDate({ ...baseOpts, date: d })).join(', ')
	}

	return `Выбрано: ${dates.length} дат`
}

/** Форматировать значение date picker с учётом режима выбора */
function formatDatePickerValue(options: FormatDatePickerValueOptions): string {
	const baseOpts = {
		dateFormat: options.dateFormat,
		showTime: options.showTime,
		showSeconds: options.showSeconds,
		is24Hour: options.is24Hour,
		locale: options.locale,
	}

	if (options.selectionMode === 'range') {
		return formatRange({
			...baseOpts,
			start: options.date,
			end: options.endDate,
		})
	}

	if (options.selectionMode === 'multiple') {
		return formatMultiple({ ...baseOpts, dates: options.dates })
	}

	if (!options.date) return ''
	return formatDate({ ...baseOpts, date: options.date })
}

/** Форматировать дату для popover календаря */
function formatPopoverDate(options: FormatPopoverDateOptions): string {
	return options.date.toLocaleDateString(options.locale, {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		weekday: 'long',
	})
}

export {
	buildDateWithTime,
	daysInMonth,
	formatDate,
	formatDatePickerValue,
	formatMultiple,
	formatPopoverDate,
	formatRange,
	getWeekday,
	getWeekNumber,
	isDateInRange,
	isSameDay,
	isToday,
	toDateOnly,
}
