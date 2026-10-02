/**
 * Утилиты: импорт и экспорт событий в iCalendar (`.ics`, RFC 5545) — VEVENT: DTSTART, DTEND или DURATION, SUMMARY,
 * DESCRIPTION, CATEGORIES, RESOURCES, RRULE, EXDATE; время с TZID пересчитывается из пояса IANA
 */
import { downloadFile } from '@utils/media/fileUtils'
import { normalizeEvent } from '../eventUtils/eventUtils'
import type { CalendarEvent, CalendarEventDate } from '../eventUtils/types/eventUtils.types'
import { formatIcsDate, formatRecurrenceRule, parseIcsDate } from '../recurrenceUtils/recurrenceUtils'
import type { IcsDuration, IcsEventDraft, IcsExportOptions, IcsProperty, IcsReader } from './types/icsUtils.types'

/** Длина строки `.ics` в байтах UTF-8 без перевода строки (RFC 5545, 3.1) */
const LINE_OCTETS = 75

/** Склеивает перенесённые строки: продолжение начинается с пробела или табуляции */
function unfold(text: string): string[] {
	return text
		.replace(/\r\n?/g, '\n')
		.replace(/\n[ \t]/g, '')
		.split('\n')
		.filter(line => line.trim() !== '')
}

/** Разделитель вне кавычек: `;` и `:` внутри значения параметра в кавычках (`CN="Иванов; ИП"`) не делят строку */
const OUTSIDE_QUOTES = '(?=(?:[^"]*"[^"]*")*[^"]*$)'
const PARAM_SEPARATOR = new RegExp(`;${OUTSIDE_QUOTES}`)
const VALUE_SEPARATOR = new RegExp(`:${OUTSIDE_QUOTES}`)

function parseProperty(line: string): IcsProperty | null {
	const colon = line.search(VALUE_SEPARATOR)
	if (colon === -1) return null
	const [name, ...rawParams] = line.slice(0, colon).split(PARAM_SEPARATOR)
	const params: Record<string, string> = {}
	for (const param of rawParams) {
		const [key, ...value] = param.split('=')
		params[key.toUpperCase()] = value.join('=').replace(/^"|"$/g, '')
	}
	return { name: name.toUpperCase(), params, value: line.slice(colon + 1) }
}

function unescapeText(value: string): string {
	return value.replace(/\\([nN,;\\])/g, (_, char: string) => (char.toLowerCase() === 'n' ? '\n' : char))
}

function escapeText(value: string): string {
	return value.replace(/[\\;,]/g, char => `\\${char}`).replace(/\r?\n/g, '\\n')
}

const ZONED_TIME = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?$/

const DAY_MS = 86_400_000

const zoneFormatters = new Map<string, Intl.DateTimeFormat | null>()

function createZoneFormatter(timeZone: string): Intl.DateTimeFormat | null {
	try {
		return new Intl.DateTimeFormat('en-US', {
			timeZone,
			hourCycle: 'h23',
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
		})
	} catch {
		return null
	}
}

/** Форматтер пояса IANA (кэш по имени): разбор файла на тысячи строк не создаёт форматтер на каждую дату; неизвестный пояс — null */
function zoneFormatter(timeZone: string): Intl.DateTimeFormat | null {
	const cached = zoneFormatters.get(timeZone)
	if (cached !== undefined) return cached
	const formatter = createZoneFormatter(timeZone)
	zoneFormatters.set(timeZone, formatter)
	return formatter
}

/** Смещение пояса от UTC в момент `time`, мс; без какой-либо части даты в ответе Intl — NaN (пояс не определить) */
function zoneOffset(time: number, formatter: Intl.DateTimeFormat): number {
	const part: Record<string, number> = Object.fromEntries(
		formatter.formatToParts(new Date(time)).map(item => [item.type, Number(item.value)]),
	)
	const wall = Date.UTC(part.year, part.month - 1, part.day, part.hour, part.minute, part.second)
	return wall - Math.floor(time / 1000) * 1000
}

/**
 * Время `20261002T100000` в поясе IANA (`TZID=Europe/Moscow`) — точный момент; пояс не из базы IANA (например,
 * имена Windows из Outlook) или смещение, которое Intl не дал посчитать, — null, время тогда считается местным.
 * RFC 5545 (3.3.5): время, которое при переходе на зимнее бывает дважды, — первое вхождение; пропущенное при
 * переходе на летнее — по смещению до перехода
 */
function zonedDate(value: string, timeZone: string): Date | null {
	const match = ZONED_TIME.exec(value.trim())
	const formatter = zoneFormatter(timeZone)
	if (!match || !formatter) return null
	const [year, month, day, hours, minutes, seconds] = match.slice(1).map(part => Number(part ?? 0))
	const wall = Date.UTC(year, month - 1, day, hours, minutes, seconds)
	const before = zoneOffset(wall - DAY_MS, formatter)
	if (Number.isNaN(before)) return null
	const valid = [before, zoneOffset(wall + DAY_MS, formatter)].filter(offset => zoneOffset(wall - offset, formatter) === offset)
	return new Date(wall - (valid.length ? Math.max(...valid) : before))
}

/** Дата свойства: VALUE=DATE — день `ГГГГ-ММ-ДД`, время с TZID — из пояса IANA, иначе — UTC (`…Z`) или местное */
function propertyDate(property: IcsProperty): CalendarEventDate | null {
	const date = parseIcsDate(property.value)
	if (!date) return null
	const isDateOnly = property.params.VALUE === 'DATE' || /^\d{8}$/.test(property.value.trim())
	if (!isDateOnly) return (property.params.TZID && zonedDate(property.value, property.params.TZID)) || date
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function applyProperty(event: IcsEventDraft, property: IcsProperty): void {
	const handlers: Record<string, () => void> = {
		UID: () => {
			event.id = property.value
		},
		SUMMARY: () => {
			event.title = unescapeText(property.value)
		},
		DESCRIPTION: () => {
			event.description = unescapeText(property.value)
		},
		CATEGORIES: () => {
			event.category = unescapeText(property.value.split(/(?<!\\),/)[0])
		},
		DTSTART: () => {
			const date = propertyDate(property)
			if (date) event.start = date
		},
		DTEND: () => {
			const date = propertyDate(property)
			if (date) event.end = date
		},
		DURATION: () => {
			event.duration = parseIcsDuration(property.value) ?? undefined
		},
		RESOURCES: () => {
			event.resourceId = unescapeText(property.value.split(/(?<!\\),/)[0])
		},
		RRULE: () => {
			event.rrule = property.value
		},
		EXDATE: () => {
			const dates = property.value.split(',').flatMap(value => propertyDate({ ...property, value }) ?? [])
			event.exdates = [...(event.exdates ?? []), ...dates]
		},
	}
	if (Object.hasOwn(handlers, property.name)) handlers[property.name]()
}

const DURATION = /^([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/

/** Длительность RFC 5545 (`PT1H30M`, `P1D`, `P2W`) — дни и миллисекунды; неверная (`P`, `PT`) или отрицательная — null */
function parseIcsDuration(value: string): IcsDuration | null {
	const match = DURATION.exec(value.trim())
	// RFC 5545 (3.3.6): нужна хотя бы одна часть — `P` и `PT` без чисел неверны, `P1DT` — тоже
	if (!match || match[1] === '-' || !match.slice(2).some(Boolean) || value.trim().endsWith('T')) return null
	const [weeks, days, hours, minutes, seconds] = match.slice(2).map(part => Number(part ?? 0))
	return { days: weeks * 7 + days, ms: ((hours * 60 + minutes) * 60 + seconds) * 1000 }
}

/** Конец по DURATION: дни — по календарю (через переход на летнее время), часы и минуты — точным временем */
function endByDuration(start: CalendarEventDate, duration: IcsDuration): CalendarEventDate | undefined {
	const item = normalizeEvent({ id: 0, title: '', start })
	// Защита: начало приходит из propertyDate и всегда разбирается — ветка нужна только типам normalizeEvent
	if (!item) return undefined
	const { start: date } = item
	const shifted = new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate() + duration.days,
		date.getHours(),
		date.getMinutes(),
		date.getSeconds(),
	)
	const end = new Date(shifted.getTime() + duration.ms)
	if (!item.allDay || typeof start !== 'string') return end
	return `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
}

function finishEvent(draft: IcsEventDraft, index: number): CalendarEvent | null {
	const { duration, ...event } = draft
	if (event.start === undefined) return null
	const end = event.end ?? (duration ? endByDuration(event.start, duration) : undefined)
	const result: CalendarEvent = { ...event, id: event.id ?? `ics-${index + 1}`, title: event.title ?? '', start: event.start }
	if (end !== undefined) result.end = end
	return result
}

/** Строка внутри открытого события: вложенные компоненты (VALARM и др.) пропускаются целиком, END:VEVENT закрывает событие */
function readEventLine(reader: IcsReader, current: IcsEventDraft, property: IcsProperty): void {
	if (property.name === 'BEGIN') reader.depth += 1
	else if (property.name === 'END' && reader.depth > 0) reader.depth -= 1
	else if (property.name === 'END' && property.value.trim().toUpperCase() === 'VEVENT') {
		const event = finishEvent(current, reader.events.length)
		if (event) reader.events.push(event)
		reader.current = null
	} else if (reader.depth === 0) applyProperty(current, property)
}

function readLine(reader: IcsReader, property: IcsProperty): void {
	if (reader.current) readEventLine(reader, reader.current, property)
	else if (property.name === 'BEGIN' && property.value.trim().toUpperCase() === 'VEVENT') reader.current = {}
}

/**
 * Разбор `.ics`: события VEVENT, у которых есть DTSTART. UID — `id` (без UID — `ics-<номер>`), SUMMARY — `title`,
 * день без времени (VALUE=DATE) — событие на весь день, первая категория CATEGORIES — `category`, первый ресурс
 * RESOURCES — `resourceId` (строкой); без DTEND конец считается по DURATION; время с TZID пересчитывается из пояса
 * IANA, пояс не из базы IANA (имена Windows из Outlook) — время считается местным. Вложенные компоненты события
 * (напоминания VALARM) пропускаются. Повторы (RRULE, EXDATE) не разворачиваются: их развернёт календарь в видимом периоде
 */
function parseIcs(text: string): CalendarEvent[] {
	const reader: IcsReader = { events: [], current: null, depth: 0 }
	for (const line of unfold(text)) {
		const property = parseProperty(line)
		if (property) readLine(reader, property)
	}
	return reader.events
}

const encoder = new TextEncoder()

/** Перенос длинной строки по 75 байт UTF-8, не разрывая символ; продолжение — с пробела */
function fold(line: string): string {
	const parts: string[] = []
	let part = ''
	let size = 0
	for (const char of line) {
		const charSize = encoder.encode(char).length
		if (size + charSize > (parts.length ? LINE_OCTETS - 1 : LINE_OCTETS)) {
			parts.push(part)
			part = ''
			size = 0
		}
		part += char
		size += charSize
	}
	parts.push(part)
	return parts.join('\r\n ')
}

function dateLine(name: string, date: Date, isDateOnly: boolean): string {
	return isDateOnly ? `${name};VALUE=DATE:${formatIcsDate(date, true)}` : `${name}:${formatIcsDate(date)}`
}

function eventLines(event: CalendarEvent, stamp: string): string[] {
	const item = normalizeEvent(event)
	if (!item) return []
	const { allDay } = item
	const lines = ['BEGIN:VEVENT', `UID:${escapeText(String(event.id))}`, `DTSTAMP:${stamp}`]
	lines.push(dateLine('DTSTART', item.start, allDay), dateLine('DTEND', item.end, allDay), `SUMMARY:${escapeText(event.title)}`)
	if (event.description) lines.push(`DESCRIPTION:${escapeText(event.description)}`)
	if (event.category) lines.push(`CATEGORIES:${escapeText(event.category)}`)
	if (event.resourceId !== undefined) lines.push(`RESOURCES:${escapeText(String(event.resourceId))}`)
	if (event.rrule)
		lines.push(
			`RRULE:${typeof event.rrule === 'string' ? event.rrule.replace(/^RRULE:/i, '') : formatRecurrenceRule(event.rrule, allDay)}`,
		)
	for (const value of event.exdates ?? []) {
		const exdate = normalizeEvent({ ...event, start: value, end: undefined, rrule: undefined })
		if (exdate) lines.push(dateLine('EXDATE', exdate.start, allDay))
	}
	lines.push('END:VEVENT')
	return lines
}

/**
 * Запись событий в `.ics`: время — в UTC (`…Z`), события на весь день — днями (VALUE=DATE); строки — CRLF и перенос
 * по 75 байт. Неверные события пропускаются
 */
function toIcs(events: readonly CalendarEvent[], options: IcsExportOptions = {}): string {
	const stamp = formatIcsDate(options.now ?? new Date())
	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		`PRODID:${options.productId ?? '-//Rise UI Kit//Event Calendar//EN'}`,
		'CALSCALE:GREGORIAN',
	]
	if (options.name) lines.push(`X-WR-CALNAME:${escapeText(options.name)}`)
	lines.push(...events.flatMap(event => eventLines(event, stamp)), 'END:VCALENDAR')
	return `${lines.map(fold).join('\r\n')}\r\n`
}

/** Чтение файла `.ics`, выбранного пользователем (BaseUpload, `<input type="file">`), — события, как у `parseIcs` */
async function readIcsFile(file: Blob): Promise<CalendarEvent[]> {
	return parseIcs(await file.text())
}

/** Скачивание событий файлом `.ics` (`toIcs`): `fileName` без расширения дополняется `.ics` */
function downloadIcs(events: readonly CalendarEvent[], fileName = 'calendar', options: IcsExportOptions = {}): void {
	const blob = new Blob([toIcs(events, options)], { type: 'text/calendar;charset=utf-8' })
	const url = URL.createObjectURL(blob)
	downloadFile(url, /\.ics$/i.test(fileName) ? fileName : `${fileName}.ics`)
	setTimeout(() => URL.revokeObjectURL(url))
}

export { downloadIcs, parseIcs, parseIcsDuration, readIcsFile, toIcs }
