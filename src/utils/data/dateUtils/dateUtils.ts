/** Утилиты: работа с датами — сравнение, парсинг, форматирование */

import { getLocale, pluralize } from '@/locales/state'
import type {
	BuildDateOptions,
	FormatDateOptions,
	FormatDatePickerValueOptions,
	FormatMultipleOptions,
	FormatPopoverDateOptions,
	FormatRangeOptions,
	FormatRelativeTimeOptions,
} from './types/dateUtils.types'

const MS_PER_DAY = 86_400_000

/** Сравнить две даты без учёта времени */
function isSameDay(a: Date, b: Date): boolean {
	return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** Получить дату без времени (обнулить часы, минуты, секунды, мс) */
function toDateOnly(d: Date): Date {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

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
	return Math.ceil(((d.getTime() - yearStart.getTime()) / MS_PER_DAY + 1) / 7)
}

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

function isToday(date: Date): boolean {
	return isSameDay(date, new Date())
}

/** Проверить, находится ли дата в диапазоне (исключая границы) */
function isDateInRange(date: Date, start: Date, end: Date): boolean {
	const d = toDateOnly(date)
	return d > toDateOnly(start) && d < toDateOnly(end)
}

export const DATE_FORMATS = ['dd.MM.yyyy', 'dd.MM.yyyy HH:mm', 'dd.MM.yyyy HH:mm:ss'] as const

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

function formatRange(options: FormatRangeOptions): string {
	const { start, end, dateFormat, showTime, showSeconds, is24Hour, locale } = options
	const baseOpts = { dateFormat, showTime, showSeconds, is24Hour, locale }

	const startStr = start ? formatDate({ ...baseOpts, date: start }) : ''
	const endStr = end ? formatDate({ ...baseOpts, date: end }) : ''

	if (!startStr && !endStr) return ''
	if (!endStr) return `${startStr} — ...`
	return `${startStr} — ${endStr}`
}

function formatMultiple(options: FormatMultipleOptions): string {
	const { dates, dateFormat, showTime, showSeconds, is24Hour, locale } = options
	if (dates.length === 0) return ''

	const baseOpts = { dateFormat, showTime, showSeconds, is24Hour, locale }

	if (dates.length <= 3) {
		return dates.map(d => formatDate({ ...baseOpts, date: d })).join(', ')
	}

	return pluralize(getLocale().plural.DATES_SELECTED, dates.length)
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

function formatPopoverDate(options: FormatPopoverDateOptions): string {
	return options.date.toLocaleDateString(options.locale, {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		weekday: 'long',
	})
}

const RELATIVE_STEPS: readonly (readonly [number, number, Intl.RelativeTimeFormatUnit])[] = [
	[45, 1, 'second'],
	[45 * 60, 60, 'minute'],
	[22 * 3600, 3600, 'hour'],
	[7 * 86_400, 86_400, 'day'],
]

/**
 * Время относительно «сейчас» по правилам языка: «сейчас», «5 минут назад», «вчера», «через 2 дня».
 * Дальше недели — дата: «3 мая», в другом году — «3 мая 2024 г.».
 */
function formatRelativeTime(date: Date | string | number, options: FormatRelativeTimeOptions = {}): string {
	const target = new Date(date)
	const now = options.now ?? new Date()
	const locale = options.locale ?? getLocale().intl
	const seconds = Math.round((target.getTime() - now.getTime()) / 1000)
	const step = RELATIVE_STEPS.find(([limit]) => Math.abs(seconds) < limit)
	if (step) {
		const [, size, unit] = step
		return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(unit === 'second' ? 0 : Math.round(seconds / size), unit)
	}
	const year = target.getFullYear() === now.getFullYear() ? undefined : 'numeric'
	return target.toLocaleDateString(locale, { day: 'numeric', month: 'long', year })
}

export {
	buildDateWithTime,
	daysInMonth,
	formatDate,
	formatDatePickerValue,
	formatMultiple,
	formatPopoverDate,
	formatRange,
	formatRelativeTime,
	getWeekday,
	getWeekNumber,
	isDateInRange,
	isSameDay,
	isToday,
	toDateOnly,
}
