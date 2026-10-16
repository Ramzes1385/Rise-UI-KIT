/** Утилиты: дата и время по запасным названиям языка (`calendarNames`) — для браузеров без данных `Intl` */
import { formatMessage } from '@/locales/state'
import type { CalendarNames, CalendarPatterns } from '@/locales/types/locales.types'
import type { DateFields, DateTexts, FallbackContext, NumericDatePart } from './types/dateFormatUtils.types'

const DATE_STYLES: Record<NonNullable<Intl.DateTimeFormatOptions['dateStyle']>, Intl.DateTimeFormatOptions> = {
	full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
	long: { day: 'numeric', month: 'long', year: 'numeric' },
	medium: { day: 'numeric', month: 'short', year: 'numeric' },
	short: { day: '2-digit', month: '2-digit', year: '2-digit' },
}

const TIME_STYLES: Record<NonNullable<Intl.DateTimeFormatOptions['timeStyle']>, Intl.DateTimeFormatOptions> = {
	short: { hour: '2-digit', minute: '2-digit' },
	medium: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
	long: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
	full: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
}

const FIELD_KEYS = ['weekday', 'year', 'month', 'day', 'hour', 'minute', 'second'] as const
const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
const NUMERIC_TOKEN = /\{(day|month|year)\}/
const TWO_DIGITS = 2
const YEAR_DIGITS = 2
const TIME_LOCALE = 'en-GB'

const zoneFormats = new Map<string, Intl.DateTimeFormat>()

function zoneFormat(timeZone: string): Intl.DateTimeFormat {
	let format = zoneFormats.get(timeZone)
	if (!format) {
		format = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short' })
		zoneFormats.set(timeZone, format)
	}
	return format
}

/** Части даты в часовом поясе: местном, UTC или любом IANA (через en-US, данные которого есть всегда) */
function dateFields(date: Date, timeZone: string | undefined): DateFields {
	if (timeZone === undefined) return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate(), weekday: date.getDay() }
	if (timeZone === 'UTC') {
		return { year: date.getUTCFullYear(), month: date.getUTCMonth(), day: date.getUTCDate(), weekday: date.getUTCDay() }
	}
	const parts = Object.fromEntries(
		zoneFormat(timeZone)
			.formatToParts(date)
			.map(part => [part.type, part.value]),
	)
	return { year: Number(parts.year), month: Number(parts.month) - 1, day: Number(parts.day), weekday: WEEKDAY_INDEX[parts.weekday] ?? 0 }
}

/** Параметры без `dateStyle`/`timeStyle`; без единого поля — числовая дата, как у `Intl.DateTimeFormat` */
function expandOptions(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormatOptions {
	const { dateStyle, timeStyle, ...fields } = options
	const expanded = { ...(dateStyle ? DATE_STYLES[dateStyle] : {}), ...(timeStyle ? TIME_STYLES[timeStyle] : {}), ...fields }
	if (FIELD_KEYS.some(key => expanded[key] !== undefined)) return expanded
	return { year: 'numeric', month: 'numeric', day: 'numeric', ...expanded }
}

function pad(value: number, style: 'numeric' | '2-digit' | undefined): string {
	if (style === undefined) return ''
	return style === '2-digit' ? String(value).padStart(TWO_DIGITS, '0') : String(value)
}

function yearText(year: number, style: 'numeric' | '2-digit' | undefined): string {
	if (style === undefined) return ''
	return style === '2-digit' ? String(year % 100).padStart(YEAR_DIGITS, '0') : String(year)
}

function lower(text: string, locale: string): string {
	return text.toLocaleLowerCase(locale)
}

/** Название месяца: отдельное слово — как в словаре, внутри даты — в нижнем регистре */
function monthName(context: FallbackContext, month: number, isStandalone: boolean): string {
	const { names, locale, options } = context
	if (options.month === 'narrow') return names.months[month].charAt(0)
	const base = options.month === 'short' ? names.monthsShort[month] : names.months[month]
	return isStandalone ? base : lower(base, locale)
}

function numericMonth(month: number, style: Intl.DateTimeFormatOptions['month']): string {
	if (style === 'numeric' || style === '2-digit') return pad(month + 1, style)
	return ''
}

function textPattern(patterns: CalendarPatterns, hasDay: boolean, hasYear: boolean): string {
	if (hasDay) return hasYear ? patterns.dayMonthYear : patterns.dayMonth
	return hasYear ? patterns.monthYear : '{month}'
}

/** Числовая дата по шаблону словаря: отсутствующие части уходят вместе с разделителем перед ними */
function numericText(pattern: string, texts: DateTexts): string {
	const chunks = pattern.split(NUMERIC_TOKEN)
	let result = ''
	for (let index = 1; index < chunks.length; index += 2) {
		const text = texts[chunks[index] as NumericDatePart]
		if (text) result += (result ? chunks[index - 1] : '') + text
	}
	return result
}

function isNameStyle(style: string | undefined): boolean {
	return style === 'long' || style === 'short' || style === 'narrow'
}

function datePart(fields: DateFields, context: FallbackContext): string {
	const { names, options } = context
	const day = pad(fields.day, options.day)
	const year = yearText(fields.year, options.year)
	const hasName = isNameStyle(options.month)
	const isStandalone = !day && !year && !options.weekday
	const month = hasName ? monthName(context, fields.month, isStandalone) : numericMonth(fields.month, options.month)
	if (!day && !month && !year) return ''
	const texts = { day, month, year }
	if (hasName) return formatMessage(textPattern(names.patterns, Boolean(day), Boolean(year)), texts)
	return numericText(names.patterns.numeric, texts) || [day, year].filter(Boolean).join(' ')
}

function weekdayName(names: CalendarNames, weekday: number, style: string | undefined): string {
	if (style === undefined) return ''
	return (style === 'long' ? names.weekdays : names.weekdaysShort)[weekday]
}

function withWeekday(date: string, weekday: string, patterns: CalendarPatterns): string {
	return date ? formatMessage(patterns.withWeekday, { date, weekday }) : weekday
}

/** Время 24 часа (или по `hour12`): цифры не зависят от языка, названий в них нет */
function timePart(date: Date, options: Intl.DateTimeFormatOptions): string {
	const { hour, minute, second, hour12, hourCycle, timeZone } = options
	if (hour === undefined && minute === undefined && second === undefined) return ''
	return new Intl.DateTimeFormat(TIME_LOCALE, { hour, minute, second, hour12, hourCycle, timeZone }).format(date)
}

/** Дата и время по названиям словаря: поддержаны `weekday`, `day`, `month`, `year`, `hour`, `minute`, `second`, `dateStyle`, `timeStyle`, `timeZone` */
export function formatFallbackDate(value: Date | number, context: FallbackContext): string {
	const date = new Date(value)
	const expanded = { ...context, options: expandOptions(context.options) }
	const { names, options } = expanded
	const fields = dateFields(date, options.timeZone)
	const dateText = datePart(fields, expanded)
	const weekday = weekdayName(names, fields.weekday, options.weekday)
	const dayText = weekday ? withWeekday(dateText, weekday, names.patterns) : dateText
	return [dayText, timePart(date, options)].filter(Boolean).join(', ')
}

/** Порядок дня, месяца и года в числовой дате словаря */
export function numericOrder(patterns: CalendarPatterns): NumericDatePart[] {
	return [...patterns.numeric.matchAll(new RegExp(NUMERIC_TOKEN, 'g'))].map(match => match[1] as NumericDatePart)
}
