import { parseIcs, toIcs } from '../icsUtils'
import type { CalendarEvent } from '../../eventUtils/types/eventUtils.types'

/** Местная дата: месяц с 1 */
const at = ([year, month, day, hours = 0, minutes = 0, seconds = 0]: number[]): Date =>
	new Date(year, month - 1, day, hours, minutes, seconds)

const NOW = new Date(Date.UTC(2026, 9, 2, 5, 0, 0))

const calendar = (...lines: string[]): string => ['BEGIN:VCALENDAR', 'VERSION:2.0', ...lines, 'END:VCALENDAR'].join('\r\n')

const byteLength = (line: string): number => new TextEncoder().encode(line).length

describe('icsUtils', () => {
	describe('parseIcs', () => {
		it('VEVENT: UID, SUMMARY, DESCRIPTION, CATEGORIES, время в UTC и местное', () => {
			const events = parseIcs(
				calendar(
					'BEGIN:VEVENT',
					'UID:meet-1',
					'DTSTART:20261002T070000Z',
					'DTEND:20261002T110000',
					'SUMMARY:Встреча\\, план\\; итоги',
					'DESCRIPTION:Строка 1\\nСтрока 2\\NСтрока 3 \\\\ конец',
					'CATEGORIES:work\\,team,personal',
					'X-UNKNOWN:что-то',
					'END:VEVENT',
				),
			)
			expect(events).toEqual([
				{
					id: 'meet-1',
					title: 'Встреча, план; итоги',
					description: 'Строка 1\nСтрока 2\nСтрока 3 \\ конец',
					category: 'work,team',
					start: new Date(Date.UTC(2026, 9, 2, 7)),
					end: at([2026, 10, 2, 11]),
				},
			])
		})

		it('свёрнутые строки (CRLF, LF, CR + пробел или таб) склеиваются', () => {
			const text = 'BEGIN:VEVENT\r\nUID:a\r\nDTSTART:20261002\r\nSUMMARY:Длинное на\r\n звание\n\tсобытия\r вконце\r\nEND:VEVENT'
			expect(parseIcs(text)[0].title).toBe('Длинное названиесобытиявконце')
		})

		it('день (VALUE=DATE или 8 цифр) — ГГГГ-ММ-ДД; EXDATE списком и несколькими строками', () => {
			const [event] = parseIcs(
				calendar(
					'BEGIN:VEVENT',
					'UID:daily',
					'DTSTART;VALUE=DATE:20261001',
					'DTEND:20261002',
					'RRULE:FREQ=DAILY;COUNT=5',
					'EXDATE;VALUE=DATE:20261002,20261003',
					'EXDATE;VALUE=DATE:20261004,плохо',
					'END:VEVENT',
				),
			)
			expect(event).toEqual({
				id: 'daily',
				title: '',
				start: '2026-10-01',
				end: '2026-10-02',
				rrule: 'FREQ=DAILY;COUNT=5',
				exdates: ['2026-10-02', '2026-10-03', '2026-10-04'],
			})
		})

		it('параметры в кавычках с двоеточием и TZID: время не пересчитывается', () => {
			const [event] = parseIcs(
				calendar('BEGIN:VEVENT', 'DTSTART;TZID="Europe/Moscow:x";X-EMPTY:20261002T100000', 'SUMMARY:A', 'END:VEVENT'),
			)
			expect(event.start).toEqual(at([2026, 10, 2, 10]))
		})

		it('без UID — ics-<номер>; без DTSTART или с неверным — пропускается; вне VEVENT и строки без двоеточия игнорируются', () => {
			const events = parseIcs(
				[
					'begin:vcalendar',
					'SUMMARY:вне события',
					'END:VEVENT',
					'begin:vevent',
					'DTSTART:20261002T100000',
					'строка без двоеточия',
					'',
					'end:vevent',
					'BEGIN:VEVENT',
					'SUMMARY:без начала',
					'END:VEVENT',
					'BEGIN:VEVENT',
					'DTSTART:вчера',
					'END:VEVENT',
					'BEGIN:VEVENT',
					'DTSTART:20261003',
					'DTEND:плохо',
					'END:VEVENT',
					'BEGIN:VTODO',
					'END:VTODO',
				].join('\n'),
			)
			expect(events).toEqual([
				{ id: 'ics-1', title: '', start: at([2026, 10, 2, 10]) },
				{ id: 'ics-2', title: '', start: '2026-10-03' },
			])
		})

		it('пустой текст — пустой список', () => {
			expect(parseIcs('')).toEqual([])
		})
	})

	describe('toIcs', () => {
		it('календарь: CRLF, PRODID, X-WR-CALNAME, DTSTAMP, время в UTC, allDay днями', () => {
			const text = toIcs(
				[
					{ id: 1, title: 'Встреча', start: new Date(Date.UTC(2026, 9, 2, 7)), end: new Date(Date.UTC(2026, 9, 2, 8)) },
					{ id: 'off', title: 'Отпуск', start: '2026-10-05', end: '2026-10-10', description: 'Море\nи горы', category: 'личное' },
				],
				{ name: 'Команда; офис', now: NOW },
			)
			expect(text.endsWith('\r\n')).toBe(true)
			expect(text.replace(/\r\n/g, '').includes('\n')).toBe(false)
			expect(text.split('\r\n')).toEqual([
				'BEGIN:VCALENDAR',
				'VERSION:2.0',
				'PRODID:-//Rise UI Kit//Event Calendar//EN',
				'CALSCALE:GREGORIAN',
				'X-WR-CALNAME:Команда\\; офис',
				'BEGIN:VEVENT',
				'UID:1',
				'DTSTAMP:20261002T050000Z',
				'DTSTART:20261002T070000Z',
				'DTEND:20261002T080000Z',
				'SUMMARY:Встреча',
				'END:VEVENT',
				'BEGIN:VEVENT',
				'UID:off',
				'DTSTAMP:20261002T050000Z',
				'DTSTART;VALUE=DATE:20261005',
				'DTEND;VALUE=DATE:20261010',
				'SUMMARY:Отпуск',
				'DESCRIPTION:Море\\nи горы',
				'CATEGORIES:личное',
				'END:VEVENT',
				'END:VCALENDAR',
				'',
			])
		})

		it('свой PRODID, без имени, без событий; DTSTAMP по умолчанию — сейчас', () => {
			vi.useFakeTimers({ now: NOW })
			try {
				expect(toIcs([], { productId: '-//App//RU' }).split('\r\n')).toEqual([
					'BEGIN:VCALENDAR',
					'VERSION:2.0',
					'PRODID:-//App//RU',
					'CALSCALE:GREGORIAN',
					'END:VCALENDAR',
					'',
				])
				expect(toIcs([{ id: 1, title: 'A', start: '2026-10-02' }])).toContain('DTSTAMP:20261002T050000Z')
			} finally {
				vi.useRealTimers()
			}
		})

		it('RRULE строкой (без префикса) и объектом, EXDATE; неверные пропуски и события пропускаются', () => {
			const events: CalendarEvent[] = [
				{
					id: 'r1',
					title: 'Стендап',
					start: new Date(Date.UTC(2026, 9, 1, 7)),
					rrule: 'RRULE:FREQ=DAILY;COUNT=5',
					exdates: [new Date(Date.UTC(2026, 9, 2, 7)), 'никогда'],
				},
				{
					id: 'r2',
					title: 'Дни рождения',
					start: '2026-10-02',
					rrule: { freq: 'YEARLY', until: at([2030, 10, 2]) },
					exdates: ['2027-10-02'],
				},
				{ id: 'bad', title: 'Плохое', start: 'когда-нибудь' },
			]
			const lines = toIcs(events, { now: NOW }).split('\r\n')
			expect(lines).toContain('RRULE:FREQ=DAILY;COUNT=5')
			expect(lines).toContain('EXDATE:20261002T070000Z')
			expect(lines).toContain('RRULE:FREQ=YEARLY;UNTIL=20301002')
			expect(lines).toContain('EXDATE;VALUE=DATE:20271002')
			expect(lines.filter(line => line.startsWith('EXDATE'))).toHaveLength(2)
			expect(lines.filter(line => line === 'BEGIN:VEVENT')).toHaveLength(2)
			expect(lines.join('\n')).not.toContain('Плохое')
		})

		it('перенос по 75 байт UTF-8 не разрывает кириллицу; продолжение — с пробела', () => {
			const title = 'Очень длинное название события с кириллицей, запятыми и ёлками — '.repeat(4)
			const text = toIcs([{ id: 'long', title, start: '2026-10-02' }], { now: NOW })
			const lines = text.split('\r\n')
			const summaryIndex = lines.findIndex(line => line.startsWith('SUMMARY:'))
			const continuation = lines.slice(summaryIndex + 1).filter(line => line.startsWith(' '))
			expect(continuation.length).toBeGreaterThan(2)
			for (const line of lines) expect(byteLength(line)).toBeLessThanOrEqual(75)
			expect(lines.some(line => line.includes('�'))).toBe(false)
			expect(byteLength(lines[summaryIndex])).toBeGreaterThan(70)
			expect(parseIcs(text)[0].title).toBe(title)
		})

		it('эмодзи (4 байта) не разрываются', () => {
			const title = '😀'.repeat(40)
			const lines = toIcs([{ id: 'e', title, start: '2026-10-02' }], { now: NOW }).split('\r\n')
			for (const line of lines) expect(byteLength(line)).toBeLessThanOrEqual(75)
			expect(parseIcs(lines.join('\r\n'))[0].title).toBe(title)
		})

		it('круг: разобрать → выгрузить → разобрать', () => {
			const source: CalendarEvent[] = [
				{
					id: 'a',
					title: 'Встреча, план; итоги \\ всё',
					start: new Date(Date.UTC(2026, 9, 2, 7)),
					end: new Date(Date.UTC(2026, 9, 2, 8, 30)),
				},
				{
					id: 'b',
					title: 'Отпуск',
					start: '2026-10-05',
					end: '2026-10-10',
					description: 'Строка 1\nСтрока 2',
					category: 'личное',
					rrule: 'FREQ=YEARLY;COUNT=3',
					exdates: ['2027-10-05'],
				},
			]
			const first = parseIcs(toIcs(source, { now: NOW }))
			expect(first).toEqual(source)
			expect(parseIcs(toIcs(first, { now: NOW }))).toEqual(first)
		})
	})
})
