import { formatFallbackDate, numericOrder } from './fallbackDate'
/** Утилиты: форматы дат, названия месяцев и дней, относительное время по языку кита; без данных `Intl` языка в браузере названия берутся из словаря (`calendarNames`) */
import { findCalendarLocale, formatMessage, getLocale } from '@/locales/state'
import type { CalendarNames, RelativeTimeNames } from '@/locales/types/locales.types'
import type { DateFormatter, DateNameStyle, NumericDatePart } from './types/dateFormatUtils.types'

const ROOT_MONTH = /^M\d+$/
const intlDataCache = new Map<string, boolean>()

function languageOf(tag: string): string {
	return tag.split('-')[0].toLowerCase()
}

function probeIntlData(intl: string): boolean {
	try {
		if (Intl.DateTimeFormat.supportedLocalesOf(intl).length === 0) return false
		const format = new Intl.DateTimeFormat(intl, { month: 'long' })
		if (languageOf(format.resolvedOptions().locale) !== languageOf(intl)) return false
		return !ROOT_MONTH.test(format.format(new Date(2000, 0, 1)))
	} catch {
		return false
	}
}

/**
 * Знает ли браузер язык для дат: есть ли для него данные `Intl`, а не английские или корневые («M05»).
 * Урезанный ICU (Chromium из Playwright, часть встроенных браузеров) не знает `kk` и отдаёт корневые данные `uz`.
 * Результат запоминается по языковому тегу.
 */
export function hasIntlData(intl: string): boolean {
	let result = intlDataCache.get(intl)
	if (result === undefined) {
		result = probeIntlData(intl)
		intlDataCache.set(intl, result)
	}
	return result
}

/** Забывает результаты `hasIntlData` — для тестов, которые подменяют `Intl` */
export function clearIntlDataCache(): void {
	intlDataCache.clear()
}

/** Запасные названия языка — только если они есть в словаре и браузер не знает язык */
function fallbackNames(intl: string): CalendarNames | undefined {
	const names = findCalendarLocale(intl)?.calendarNames
	return names && !hasIntlData(intl) ? names : undefined
}

function joinRange(start: string, end: string): string {
	return start === end ? start : `${start} – ${end}`
}

/**
 * Форматировщик дат: `Intl.DateTimeFormat`, а если для языка в браузере нет данных, но в словаре есть `calendarNames`, —
 * форматировщик на названиях словаря (поддержаны `weekday`, `day`, `month`, `year`, `hour`, `minute`, `second`, `dateStyle`, `timeStyle`, `timeZone`).
 * Единая точка для компонентов кита: `new Intl.DateTimeFormat(locale, …)` в них не вызывается.
 */
export function createDateFormat(intl: string | undefined, options: Intl.DateTimeFormatOptions = {}): DateFormatter {
	const names = intl === undefined ? undefined : fallbackNames(intl)
	if (!intl || !names) return new Intl.DateTimeFormat(intl, options)
	const format = (date?: Date | number): string => formatFallbackDate(date ?? Date.now(), { names, locale: intl, options })
	return { format, formatRange: (start, end) => joinRange(format(start), format(end)) }
}

/** Дата текстом по языку кита (или по явному языковому тегу): то же, что `createDateFormat(intl, options).format(date)` */
export function formatDateText(date: Date | number, options: Intl.DateTimeFormatOptions, intl: string = getLocale().intl): string {
	return createDateFormat(intl, options).format(date)
}

/** Двенадцать названий месяцев с января: отдельные слова («Мамыр» в заголовке календаря) */
export function getMonthNames(intl: string, style: DateNameStyle = 'long'): string[] {
	const names = fallbackNames(intl)
	if (names) return [...(style === 'long' ? names.months : names.monthsShort)]
	const format = new Intl.DateTimeFormat(intl, { month: style })
	return Array.from({ length: 12 }, (_, index) => format.format(new Date(2000, index, 1)))
}

/** Семь названий дней недели с воскресенья: 1 января 2023 — воскресенье */
export function getWeekdayNames(intl: string, style: DateNameStyle = 'short'): string[] {
	const names = fallbackNames(intl)
	if (names) return [...(style === 'long' ? names.weekdays : names.weekdaysShort)]
	const format = new Intl.DateTimeFormat(intl, { weekday: style })
	return Array.from({ length: 7 }, (_, index) => format.format(new Date(2023, 0, 1 + index)))
}

/** Порядок дня, месяца и года в числовой дате языка: `['day', 'month', 'year']` для `07.05.2025` */
export function getNumericDateOrder(intl: string): NumericDatePart[] {
	const names = fallbackNames(intl)
	if (names) return numericOrder(names.patterns)
	const sample = new Date(2000, 10, 25)
	const parts = new Intl.DateTimeFormat(intl, { day: '2-digit', month: '2-digit', year: 'numeric' }).formatToParts(sample)
	return parts.map(part => part.type).filter((type): type is NumericDatePart => type === 'day' || type === 'month' || type === 'year')
}

function relativeFallback(value: number, unit: Intl.RelativeTimeFormatUnit, names: RelativeTimeNames): string | undefined {
	const singular = unit.replace(/s$/, '')
	if (singular === 'second') return names.now
	if (singular === 'day' && Math.abs(value) === 1) return value < 0 ? names.yesterday : names.tomorrow
	if (singular !== 'minute' && singular !== 'hour' && singular !== 'day') return undefined
	const forms = value < 0 ? names.past : names.future
	return formatMessage(forms[singular], { n: Math.abs(value) })
}

/** Относительное время («5 минут назад», «вчера») по языку; без данных `Intl` — по фразам словаря (`relativeTime`) */
export function formatRelativeUnit(value: number, unit: Intl.RelativeTimeFormatUnit, intl: string): string {
	const names = findCalendarLocale(intl)?.relativeTime
	const fallback = names && !hasIntlData(intl) ? relativeFallback(value, unit, names) : undefined
	return fallback ?? new Intl.RelativeTimeFormat(intl, { numeric: 'auto' }).format(value, unit)
}
