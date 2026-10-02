/** Утилиты: импорт и экспорт событий в iCalendar (`.ics`, RFC 5545) — VEVENT: DTSTART, DTEND, SUMMARY, DESCRIPTION, RRULE, EXDATE */
import { normalizeEvent } from '../eventUtils/eventUtils'
import type { IcsExportOptions, IcsProperty } from './types/icsUtils.types'
import type { CalendarEvent, CalendarEventDate } from '../eventUtils/types/eventUtils.types'
import { formatIcsDate, formatRecurrenceRule, parseIcsDate } from '../recurrenceUtils/recurrenceUtils'

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

function parseProperty(line: string): IcsProperty | null {
	const colon = line.search(/:(?=(?:[^"]*"[^"]*")*[^"]*$)/)
	if (colon === -1) return null
	const [name, ...rawParams] = line.slice(0, colon).split(';')
	const params: Record<string, string> = {}
	for (const param of rawParams) {
		const [key, value = ''] = param.split('=')
		params[key.toUpperCase()] = value.replace(/^"|"$/g, '')
	}
	return { name: name.toUpperCase(), params, value: line.slice(colon + 1) }
}

function unescapeText(value: string): string {
	return value.replace(/\\([nN,;\\])/g, (_, char: string) => (char.toLowerCase() === 'n' ? '\n' : char))
}

function escapeText(value: string): string {
	return value.replace(/[\\;,]/g, char => `\\${char}`).replace(/\r?\n/g, '\\n')
}

/** Дата свойства: VALUE=DATE — день `ГГГГ-ММ-ДД`, иначе Date; TZID не пересчитывается — время считается местным */
function propertyDate(property: IcsProperty): CalendarEventDate | null {
	const date = parseIcsDate(property.value)
	if (!date) return null
	const isDateOnly = property.params.VALUE === 'DATE' || /^\d{8}$/.test(property.value.trim())
	if (!isDateOnly) return date
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function applyProperty(event: Partial<CalendarEvent>, property: IcsProperty): void {
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
			event.start = propertyDate(property) ?? undefined
		},
		DTEND: () => {
			event.end = propertyDate(property) ?? undefined
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

function finishEvent(event: Partial<CalendarEvent>, index: number): CalendarEvent | null {
	if (event.start === undefined) return null
	return { ...event, id: event.id ?? `ics-${index + 1}`, title: event.title ?? '', start: event.start }
}

/**
 * Разбор `.ics`: события VEVENT, у которых есть DTSTART. UID — `id` (без UID — `ics-<номер>`), SUMMARY — `title`,
 * день без времени (VALUE=DATE) — событие на весь день, первая категория CATEGORIES — `category`. Повторы (RRULE,
 * EXDATE) не разворачиваются: их развернёт календарь в видимом периоде
 */
function parseIcs(text: string): CalendarEvent[] {
	const events: CalendarEvent[] = []
	let current: Partial<CalendarEvent> | null = null
	for (const line of unfold(text)) {
		const property = parseProperty(line)
		if (!property) continue
		if (property.name === 'BEGIN' && property.value.toUpperCase() === 'VEVENT') current = {}
		else if (property.name === 'END' && property.value.toUpperCase() === 'VEVENT' && current) {
			const event = finishEvent(current, events.length)
			if (event) events.push(event)
			current = null
		} else if (current) applyProperty(current, property)
	}
	return events
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

export { parseIcs, toIcs }
