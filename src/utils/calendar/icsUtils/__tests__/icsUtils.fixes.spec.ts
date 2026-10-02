import { parseIcs, parseIcsDuration } from '../icsUtils'

const vevent = (...lines: string[]): string => ['BEGIN:VCALENDAR', 'BEGIN:VEVENT', ...lines, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')

describe('icsUtils — исправление по отчёту тестов (1124)', () => {
	it('parseIcsDuration: «P» и «PT» без частей — null (RFC 5545, 3.3.6)', () => {
		expect(parseIcsDuration('P')).toBeNull()
		expect(parseIcsDuration(' P ')).toBeNull()
		expect(parseIcsDuration('+P')).toBeNull()
		expect(parseIcsDuration('PT')).toBeNull()
		expect(parseIcsDuration('P1DT')).toBeNull()
		expect(parseIcsDuration('PT0S')).toEqual({ days: 0, ms: 0 })
		expect(parseIcsDuration('P0D')).toEqual({ days: 0, ms: 0 })
	})

	it('parseIcs: DURATION:P не задаёт конец', () => {
		const [event] = parseIcs(vevent('UID:a', 'DTSTART:20261002T100000Z', 'DURATION:P'))
		expect(event).toBeDefined()
		expect('end' in event).toBe(false)
	})

	it('parseIcs: неверный DTEND не оставляет ключ end', () => {
		const [event] = parseIcs(vevent('UID:a', 'DTSTART:20261002T100000Z', 'DTEND:мусор'))
		expect(event.start).toEqual(new Date('2026-10-02T10:00:00Z'))
		expect(Object.keys(event)).not.toContain('end')
	})

	it('parseIcs: неверный DTSTART после верного не стирает начало', () => {
		const [event] = parseIcs(vevent('UID:a', 'DTSTART:20261002T100000Z', 'DTSTART:мусор'))
		expect(event.start).toEqual(new Date('2026-10-02T10:00:00Z'))
	})

	it('parseIcs: только неверный DTSTART — событие пропускается', () => {
		expect(parseIcs(vevent('UID:a', 'DTSTART:мусор'))).toEqual([])
	})
})
