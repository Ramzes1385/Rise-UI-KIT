import { parseIcs } from '../icsUtils'

const vevent = (...lines: string[]): string => ['BEGIN:VCALENDAR', 'BEGIN:VEVENT', ...lines, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')

describe('icsUtils — вложенные компоненты, переход времени, параметры в кавычках', () => {
	it('VALARM внутри события не перезаписывает DESCRIPTION и не задаёт конец по своей DURATION', () => {
		const [event] = parseIcs(
			vevent(
				'UID:a',
				'DTSTART:20261002T100000Z',
				'DESCRIPTION:Повестка',
				'BEGIN:VALARM',
				'ACTION:DISPLAY',
				'DESCRIPTION:This is an event reminder',
				'TRIGGER:-P0DT0H30M0S',
				'DURATION:PT15M',
				'END:VALARM',
				'SUMMARY:Планёрка',
			),
		)
		expect(event).toEqual({ id: 'a', title: 'Планёрка', description: 'Повестка', start: new Date('2026-10-02T10:00:00Z') })
	})

	it('несколько и вложенные друг в друга компоненты пропускаются целиком, свойства после них читаются', () => {
		const [event] = parseIcs(
			vevent(
				'UID:a',
				'BEGIN:VALARM',
				'DTSTART:20200101T000000Z',
				'BEGIN:X-INNER',
				'SUMMARY:внутри',
				'END:X-INNER',
				'SUMMARY:напоминание',
				'END:VALARM',
				'begin:x-other',
				'DTEND:20200101T000000Z',
				'end:x-other',
				'DTSTART:20261002T100000Z',
				'DTEND:20261002T110000Z',
				'SUMMARY:Событие',
			),
		)
		expect(event).toEqual({
			id: 'a',
			title: 'Событие',
			start: new Date('2026-10-02T10:00:00Z'),
			end: new Date('2026-10-02T11:00:00Z'),
		})
	})

	it('END не своего компонента на верхнем уровне события не закрывает событие', () => {
		const events = parseIcs(vevent('UID:a', 'DTSTART:20261002T100000Z', 'END:VALARM', 'SUMMARY:После'))
		expect(events).toHaveLength(1)
		expect(events[0].title).toBe('После')
	})

	it('компоненты вне события (VTIMEZONE) не открывают событие', () => {
		const text = [
			'BEGIN:VCALENDAR',
			'BEGIN:VTIMEZONE',
			'TZID:Europe/Berlin',
			'BEGIN:STANDARD',
			'DTSTART:19701025T030000',
			'END:STANDARD',
			'END:VTIMEZONE',
			'BEGIN:VEVENT',
			'UID:b',
			'DTSTART:20261002T100000Z',
			'END:VEVENT',
			'END:VCALENDAR',
		].join('\r\n')
		expect(parseIcs(text).map(event => event.id)).toEqual(['b'])
	})

	it('время, которое при переходе на зимнее бывает дважды, — первое вхождение (RFC 5545, 3.3.5)', () => {
		const [event] = parseIcs(vevent('UID:a', 'DTSTART;TZID=Europe/Berlin:20261025T023000'))
		expect(event.start).toEqual(new Date('2026-10-25T00:30:00Z'))
	})

	it('время, пропущенное при переходе на летнее, — по смещению до перехода', () => {
		const [event] = parseIcs(vevent('UID:a', 'DTSTART;TZID=Europe/Berlin:20260329T023000'))
		expect(event.start).toEqual(new Date('2026-03-29T01:30:00Z'))
	})

	it('время рядом с переходом и в южном полушарии считается по своему смещению', () => {
		const [before, after, south] = parseIcs(
			[
				vevent('UID:a', 'DTSTART;TZID=Europe/Berlin:20261025T013000'),
				vevent('UID:b', 'DTSTART;TZID=Europe/Berlin:20261025T033000'),
				vevent('UID:c', 'DTSTART;TZID=Australia/Sydney:20260405T023000'),
			].join('\r\n'),
		)
		expect(before.start).toEqual(new Date('2026-10-24T23:30:00Z'))
		expect(after.start).toEqual(new Date('2026-10-25T02:30:00Z'))
		expect(south.start).toEqual(new Date('2026-04-04T15:30:00Z'))
	})

	it('один и тот же пояс в нескольких событиях и неизвестный пояс повторно — разбираются одинаково', () => {
		const events = parseIcs(
			[
				vevent('UID:a', 'DTSTART;TZID=Europe/Moscow:20261002T100000'),
				vevent('UID:b', 'DTSTART;TZID=Europe/Moscow:20261002T100000'),
				vevent('UID:c', 'DTSTART;TZID=Нет/Пояса:20261002T100000'),
				vevent('UID:d', 'DTSTART;TZID=Нет/Пояса:20261002T100000'),
			].join('\r\n'),
		)
		expect(events.map(event => event.start)).toEqual([
			new Date('2026-10-02T07:00:00Z'),
			new Date('2026-10-02T07:00:00Z'),
			new Date(2026, 9, 2, 10),
			new Date(2026, 9, 2, 10),
		])
	})

	it('значение параметра в кавычках с «;», «:» и «=» не режется', () => {
		const [event] = parseIcs(
			vevent(
				'UID:a',
				'ORGANIZER;CN="Иванов; ИП: офис=2";X-FLAG:mailto:ivanov@example.com',
				'DTSTART;TZID=Europe/Moscow;X-NOTE="a;TZID=Asia/Tokyo":20261002T100000',
				'SUMMARY;LANGUAGE=ru:Встреча',
			),
		)
		expect(event.start).toEqual(new Date('2026-10-02T07:00:00Z'))
		expect(event.title).toBe('Встреча')
	})
})
