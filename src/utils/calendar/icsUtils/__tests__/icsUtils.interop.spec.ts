import * as eventUtils from '../../eventUtils/eventUtils'
import type { CalendarEvent } from '../../eventUtils/types/eventUtils.types'
import { downloadIcs, parseIcs, parseIcsDuration, readIcsFile, toIcs } from '..'

vi.mock('../../eventUtils/eventUtils', async importOriginal => {
	const actual = await importOriginal<typeof import('../../eventUtils/eventUtils')>()
	return { ...actual, normalizeEvent: vi.fn(actual.normalizeEvent) }
})

const NOW = new Date(Date.UTC(2026, 9, 1, 12, 0, 0))

/** Календарь из строк VEVENT, строки — через CRLF */
function calendar(...events: string[][]): string {
	return ['BEGIN:VCALENDAR', 'VERSION:2.0', ...events.flatMap(lines => ['BEGIN:VEVENT', ...lines, 'END:VEVENT']), 'END:VCALENDAR'].join(
		'\r\n',
	)
}

function single(...lines: string[]): CalendarEvent {
	const [event] = parseIcs(calendar(lines))
	return event
}

afterEach(() => {
	vi.restoreAllMocks()
	vi.useRealTimers()
})

describe('icsUtils', () => {
	describe('parseIcsDuration', () => {
		it('часы и минуты — миллисекунды', () => {
			expect(parseIcsDuration('PT1H30M')).toEqual({ days: 0, ms: 90 * 60_000 })
		})

		it('недели — по 7 дней', () => {
			expect(parseIcsDuration('P1W')).toEqual({ days: 7, ms: 0 })
		})

		it('дни, время с секундами и знак «+»', () => {
			expect(parseIcsDuration(' +P2DT0H0M15S ')).toEqual({ days: 2, ms: 15_000 })
		})

		it.each(['-PT1H', 'PT', 'P1DT', 'час', '', 'PT1X'])('«%s» — null', value => {
			expect(parseIcsDuration(value)).toBeNull()
		})
	})

	describe('parseIcs — свойства', () => {
		it('UID, SUMMARY, DESCRIPTION, CATEGORIES и RESOURCES', () => {
			expect(
				single(
					'UID:abc-1',
					'SUMMARY:Встреча\\, план\\; итоги',
					'DESCRIPTION:Строка 1\\nСтрока 2\\NСтрока 3\\\\',
					'CATEGORIES:Работа\\,офис,Личное',
					'RESOURCES:room\\,1,proj',
					'DTSTART:20261002T070000Z',
				),
			).toEqual({
				id: 'abc-1',
				title: 'Встреча, план; итоги',
				description: 'Строка 1\nСтрока 2\nСтрока 3\\',
				category: 'Работа,офис',
				resourceId: 'room,1',
				start: new Date(Date.UTC(2026, 9, 2, 7)),
			})
		})

		it('RESOURCES — первый ресурс строкой', () => {
			expect(single('DTSTART:20261002T070000Z', 'RESOURCES:room-1,proj').resourceId).toBe('room-1')
		})

		it('без UID — id «ics-<номер>», без SUMMARY — пустое название', () => {
			const events = parseIcs(calendar(['DTSTART:20261002T070000Z'], ['DTSTART:20261003T070000Z']))
			expect(events.map(event => [event.id, event.title])).toEqual([
				['ics-1', ''],
				['ics-2', ''],
			])
		})

		it('событие без DTSTART или с неверным DTSTART пропускается', () => {
			expect(parseIcs(calendar(['SUMMARY:Без начала'], ['DTSTART:завтра'], ['DTSTART:20261002']))).toHaveLength(1)
		})

		it('RRULE и EXDATE сохраняются строкой и датами, EXDATE в нескольких строках складываются', () => {
			const event = single(
				'DTSTART:20261002T070000Z',
				'RRULE:FREQ=DAILY;COUNT=5',
				'EXDATE:20261003T070000Z,плохо,20261004T070000Z',
				'EXDATE;VALUE=DATE:20261005',
			)
			expect(event.rrule).toBe('FREQ=DAILY;COUNT=5')
			expect(event.exdates).toEqual([new Date(Date.UTC(2026, 9, 3, 7)), new Date(Date.UTC(2026, 9, 4, 7)), '2026-10-05'])
		})

		it('неизвестные свойства и строки без двоеточия пропускаются', () => {
			expect(single('DTSTART:20261002T070000Z', 'X-UNKNOWN:1', 'мусор без двоеточия', 'LOCATION:Офис')).toEqual({
				id: 'ics-1',
				title: '',
				start: new Date(Date.UTC(2026, 9, 2, 7)),
			})
		})

		it('свойства вне VEVENT и лишний END:VEVENT не создают событий', () => {
			const text = ['SUMMARY:вне', 'END:VEVENT', 'begin:vevent', 'summary:Маленькими', 'dtstart:20261002T070000Z', 'end:vevent'].join(
				'\n',
			)
			expect(parseIcs(text)).toEqual([{ id: 'ics-1', title: 'Маленькими', start: new Date(Date.UTC(2026, 9, 2, 7)) }])
		})

		it('склеивает перенесённые строки (пробел и табуляция), понимает CR и пустые строки', () => {
			const text = ['BEGIN:VEVENT', 'SUMMARY:Длинное', ' название', '\tсобытия', '', 'DTSTART:20261002T070000Z', 'END:VEVENT'].join(
				'\r',
			)
			expect(parseIcs(text)[0].title).toBe('Длинноеназваниесобытия')
		})

		it('двоеточие в параметре в кавычках не считается началом значения, параметр без значения — пустой', () => {
			const event = single('DTSTART:20261002T070000Z', 'DESCRIPTION;ALTREP="http://x.ru/a:b";X-FLAG:Текст: с двоеточием')
			expect(event.description).toBe('Текст: с двоеточием')
		})

		it('пустой текст — пустой список', () => {
			expect(parseIcs('')).toEqual([])
		})
	})

	describe('parseIcs — даты', () => {
		it('время в UTC (…Z) — точный момент', () => {
			expect(single('DTSTART:20261002T070000Z').start).toEqual(new Date(Date.UTC(2026, 9, 2, 7)))
		})

		it('время без Z и без TZID — местное', () => {
			expect(single('DTSTART:20261002T1000').start).toEqual(new Date(2026, 9, 2, 10))
		})

		it('TZID из базы IANA — время пересчитывается из пояса', () => {
			expect(single('DTSTART;TZID=Europe/Moscow:20261002T100000').start).toEqual(new Date('2026-10-02T07:00:00Z'))
		})

		it('TZID в кавычках и время без секунд', () => {
			expect(single('DTSTART;TZID="America/New_York":20260115T0900').start).toEqual(new Date('2026-01-15T14:00:00Z'))
		})

		it('TZID учитывает летнее время пояса', () => {
			expect(single('DTSTART;TZID=America/New_York:20260715T090000').start).toEqual(new Date('2026-07-15T13:00:00Z'))
		})

		it('TZID не из базы IANA (имя Windows) — время местное', () => {
			expect(single('DTSTART;TZID=Russian Standard Time:20261002T100000').start).toEqual(new Date(2026, 9, 2, 10))
		})

		it('TZID при времени с Z — время берётся как UTC', () => {
			expect(single('DTSTART;TZID=Europe/Moscow:20261002T070000Z').start).toEqual(new Date(Date.UTC(2026, 9, 2, 7)))
		})

		it('день (VALUE=DATE или 8 цифр) — строка ГГГГ-ММ-ДД, TZID у дня не мешает', () => {
			expect(single('DTSTART;VALUE=DATE:20261002').start).toBe('2026-10-02')
			expect(single('DTSTART;TZID=Europe/Moscow:20261002', 'DTEND:20261004').end).toBe('2026-10-04')
		})

		describe('Intl — свежий модуль: форматтер пояса кэшируется, подмена Intl действует только до первого разбора пояса', () => {
			const RealFormat = Intl.DateTimeFormat
			const NEW_YORK = 'DTSTART;TZID=America/New_York:20261002T100000'

			async function freshSingle(...lines: string[]): Promise<CalendarEvent> {
				vi.resetModules()
				const fresh = await import('..')
				const [event] = fresh.parseIcs(calendar(lines))
				return event
			}

			function mockParts(filter: (part: Intl.DateTimeFormatPart) => boolean): void {
				vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(function (...args: ConstructorParameters<typeof Intl.DateTimeFormat>) {
					const real = new RealFormat(...args)
					return Object.assign(real, {
						formatToParts: (date?: Date) => RealFormat.prototype.formatToParts.call(real, date).filter(filter),
					})
				})
			}

			it('без подмены — время из пояса (контроль свежего модуля)', async () => {
				expect((await freshSingle(NEW_YORK)).start).toEqual(new Date('2026-10-02T14:00:00Z'))
			})

			it('ответ Intl без частей даты — время местное, как у неизвестного пояса, а не NaN', async () => {
				mockParts(() => false)
				const start = (await freshSingle(NEW_YORK)).start as Date
				expect(Number.isNaN(start.getTime())).toBe(false)
				expect(start).toEqual(new Date(2026, 9, 2, 10))
			})

			it('в ответе Intl нет одной части (года) — время местное', async () => {
				mockParts(part => part.type !== 'year')
				expect((await freshSingle(NEW_YORK)).start).toEqual(new Date(2026, 9, 2, 10))
			})

			it('Intl не создаёт форматтер пояса — время местное', async () => {
				vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(function () {
					throw new RangeError('нет пояса')
				})
				expect((await freshSingle(NEW_YORK)).start).toEqual(new Date(2026, 9, 2, 10))
			})

			it('форматтер создаётся один раз на пояс, в том числе для неизвестного', async () => {
				const spy = vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(function (
					...args: ConstructorParameters<typeof Intl.DateTimeFormat>
				) {
					return new RealFormat(...args)
				})
				vi.resetModules()
				const fresh = await import('..')
				const events = fresh.parseIcs(
					calendar(
						[NEW_YORK, 'DTEND;TZID=America/New_York:20261002T110000'],
						['DTSTART;TZID=America/New_York:20260715T090000'],
						['DTSTART;TZID=Нет/Пояса:20261002T100000'],
						['DTSTART;TZID=Нет/Пояса:20261003T100000'],
					),
				)
				expect(events.map(event => event.start)).toEqual([
					new Date('2026-10-02T14:00:00Z'),
					new Date('2026-07-15T13:00:00Z'),
					new Date(2026, 9, 2, 10),
					new Date(2026, 9, 3, 10),
				])
				const zones = spy.mock.calls.map(([, options]) => options?.timeZone).filter(Boolean)
				expect(zones).toEqual(['America/New_York', 'Нет/Пояса'])
			})
		})
	})

	describe('parseIcs — конец', () => {
		it('DURATION без DTEND — конец +1:30', () => {
			const event = single('DTSTART:20261002T070000Z', 'DURATION:PT1H30M')
			expect(event.end).toEqual(new Date(Date.UTC(2026, 9, 2, 8, 30)))
			expect(event).not.toHaveProperty('duration')
		})

		it('DURATION P2D у дня — конец днём +2', () => {
			expect(single('DTSTART;VALUE=DATE:20261002', 'DURATION:P2D').end).toBe('2026-10-04')
		})

		it('DURATION в днях у времени — тот же час через N дней по календарю', () => {
			expect(single('DTSTART:20261002T1000', 'DURATION:P1DT30M').end).toEqual(new Date(2026, 9, 3, 10, 30))
		})

		it('DTEND важнее DURATION — в любом порядке', () => {
			expect(single('DTSTART:20261002T070000Z', 'DTEND:20261002T090000Z', 'DURATION:PT1H').end).toEqual(
				new Date(Date.UTC(2026, 9, 2, 9)),
			)
			expect(single('DTSTART:20261002T070000Z', 'DURATION:PT1H', 'DTEND:20261002T090000Z').end).toEqual(
				new Date(Date.UTC(2026, 9, 2, 9)),
			)
		})

		it('неверная DURATION и неверный DTEND — без конца', () => {
			expect(single('DTSTART:20261002T070000Z', 'DURATION:-PT1H', 'DTEND:потом').end).toBeUndefined()
		})

		it('без DTEND и DURATION — без конца', () => {
			expect(single('DTSTART:20261002T070000Z')).not.toHaveProperty('end')
		})

		it('начало, которое не разобралось при расчёте конца, — без конца (защитная ветка)', () => {
			vi.mocked(eventUtils.normalizeEvent).mockReturnValueOnce(null)
			expect(single('DTSTART:20261002T070000Z', 'DURATION:PT1H')).not.toHaveProperty('end')
		})
	})

	describe('toIcs', () => {
		it('пустой календарь — заголовок, PRODID по умолчанию, CRLF', () => {
			expect(toIcs([], { now: NOW })).toBe(
				[
					'BEGIN:VCALENDAR',
					'VERSION:2.0',
					'PRODID:-//Rise UI Kit//Event Calendar//EN',
					'CALSCALE:GREGORIAN',
					'END:VCALENDAR',
					'',
				].join('\r\n'),
			)
		})

		it('без настроек — PRODID по умолчанию и без имени календаря', () => {
			const text = toIcs([])
			expect(text).toContain('PRODID:-//Rise UI Kit//Event Calendar//EN\r\n')
			expect(text).not.toContain('X-WR-CALNAME')
		})

		it('имя календаря и PRODID, DTSTAMP по умолчанию — текущее время', () => {
			vi.useFakeTimers({ now: NOW, toFake: ['Date'] })
			const text = toIcs([{ id: 1, title: 'A', start: NOW }], { name: 'Команда; план', productId: '-//Acme//RU' })
			expect(text).toContain('PRODID:-//Acme//RU\r\n')
			expect(text).toContain('X-WR-CALNAME:Команда\\; план\r\n')
			expect(text).toContain('DTSTAMP:20261001T120000Z\r\n')
		})

		it('событие со временем — UTC, поля с экранированием, RESOURCES', () => {
			const text = toIcs(
				[
					{
						id: 'a,1',
						title: 'План; итоги',
						start: new Date(Date.UTC(2026, 9, 2, 7)),
						end: new Date(Date.UTC(2026, 9, 2, 8, 30)),
						description: 'Строка 1\nСтрока 2\\',
						category: 'Работа',
						resourceId: 'room;1',
					},
				],
				{ now: NOW },
			)
			const lines = text.split('\r\n')
			expect(lines).toEqual(
				expect.arrayContaining([
					'UID:a\\,1',
					'DTSTART:20261002T070000Z',
					'DTEND:20261002T083000Z',
					'SUMMARY:План\\; итоги',
					'DESCRIPTION:Строка 1\\nСтрока 2\\\\',
					'CATEGORIES:Работа',
					'RESOURCES:room\\;1',
				]),
			)
		})

		it('числовой resourceId 0 пишется, отсутствующий — нет', () => {
			expect(toIcs([{ id: 1, title: 'A', start: NOW, resourceId: 0 }], { now: NOW })).toContain('RESOURCES:0\r\n')
			expect(toIcs([{ id: 1, title: 'A', start: NOW }], { now: NOW })).not.toContain('RESOURCES')
		})

		it('событие на весь день — VALUE=DATE, конец по умолчанию — следующий день', () => {
			const text = toIcs([{ id: 1, title: 'День', start: '2026-10-02' }], { now: NOW })
			expect(text).toContain('DTSTART;VALUE=DATE:20261002\r\n')
			expect(text).toContain('DTEND;VALUE=DATE:20261003\r\n')
		})

		it('RRULE строкой (с префиксом и без) и объектом, EXDATE — по одной строке, неверные пропускаются', () => {
			const withPrefix = toIcs([{ id: 1, title: 'A', start: '2026-10-02', rrule: 'rrule:FREQ=DAILY' }], { now: NOW })
			expect(withPrefix).toContain('RRULE:FREQ=DAILY\r\n')
			const fromObject = toIcs(
				[
					{
						id: 1,
						title: 'A',
						start: '2026-10-02',
						rrule: { freq: 'WEEKLY', count: 3 },
						exdates: ['2026-10-09', 'плохо', '2026-10-16'],
					},
				],
				{ now: NOW },
			)
			expect(fromObject).toMatch(/RRULE:FREQ=WEEKLY;COUNT=3\r\n/)
			expect(fromObject).toContain('EXDATE;VALUE=DATE:20261009\r\nEXDATE;VALUE=DATE:20261016\r\n')
		})

		it('неверные события пропускаются', () => {
			const text = toIcs(
				[
					{ id: 1, title: 'Плохо', start: 'не дата' },
					{ id: 2, title: 'Хорошо', start: NOW },
				],
				{ now: NOW },
			)
			expect(text).not.toContain('Плохо')
			expect(text.match(/BEGIN:VEVENT/g)).toHaveLength(1)
		})

		it('длинные строки переносятся по 75 байт UTF-8, не разрывая символ', () => {
			const title = 'Я'.repeat(100)
			const text = toIcs([{ id: 1, title, start: NOW }], { now: NOW })
			const encoder = new TextEncoder()
			const lines = text.split('\r\n').filter(Boolean)
			for (const line of lines) expect(encoder.encode(line).length).toBeLessThanOrEqual(75)
			const summary = lines.findIndex(line => line.startsWith('SUMMARY:'))
			expect(lines[summary + 1].startsWith(' Я')).toBe(true)
			expect(parseIcs(text)[0].title).toBe(title)
		})
	})

	describe('экспорт и обратный разбор', () => {
		it('события возвращаются теми же после toIcs → parseIcs', () => {
			const events: CalendarEvent[] = [
				{
					id: 'meet-1',
					title: 'Встреча, план; итоги',
					start: new Date(Date.UTC(2026, 9, 2, 7)),
					end: new Date(Date.UTC(2026, 9, 2, 8, 30)),
					description: 'Первая\nвторая',
					category: 'Работа',
					resourceId: 'room-1',
				},
				{ id: 'day-1', title: 'Отпуск', start: '2026-10-05', end: '2026-10-08', rrule: 'FREQ=YEARLY', exdates: ['2027-10-05'] },
			]
			expect(parseIcs(toIcs(events, { now: NOW }))).toEqual(events)
		})

		it('числовые id и resourceId возвращаются строками', () => {
			const [event] = parseIcs(toIcs([{ id: 7, title: 'A', start: NOW, resourceId: 2 }], { now: NOW }))
			expect(event).toMatchObject({ id: '7', resourceId: '2' })
		})
	})

	describe('readIcsFile', () => {
		it('читает события из файла', async () => {
			const file = new Blob([calendar(['UID:f1', 'SUMMARY:Из файла', 'DTSTART;VALUE=DATE:20261002', 'RESOURCES:room-2'])])
			await expect(readIcsFile(file)).resolves.toEqual([{ id: 'f1', title: 'Из файла', start: '2026-10-02', resourceId: 'room-2' }])
		})
	})

	describe('downloadIcs', () => {
		function mockUrls() {
			const createObjectURL = vi.fn((_: Blob) => 'blob:http://localhost/ics')
			const revokeObjectURL = vi.fn()
			Object.assign(URL, { createObjectURL, revokeObjectURL })
			const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
			return { createObjectURL, revokeObjectURL, click }
		}

		it('скачивает файл <имя>.ics с текстом toIcs и освобождает ссылку', async () => {
			vi.useFakeTimers({ toFake: ['setTimeout'] })
			const { createObjectURL, revokeObjectURL, click } = mockUrls()
			const events: CalendarEvent[] = [{ id: 1, title: 'A', start: NOW }]
			downloadIcs(events, 'team', { now: NOW })
			const blob = createObjectURL.mock.calls[0][0]
			expect(blob.type).toBe('text/calendar;charset=utf-8')
			expect(await blob.text()).toBe(toIcs(events, { now: NOW }))
			const link = click.mock.contexts[0] as HTMLAnchorElement
			expect(link.download).toBe('team.ics')
			expect(link.href).toBe('blob:http://localhost/ics')
			expect(document.querySelector('a[download]')).toBeNull()
			expect(revokeObjectURL).not.toHaveBeenCalled()
			vi.runAllTimers()
			expect(revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/ics')
		})

		it('имя с .ics не дублируется, без имени — calendar.ics', () => {
			const { click } = mockUrls()
			downloadIcs([], 'Team.ICS')
			downloadIcs([])
			expect(click.mock.contexts.map(link => (link as HTMLAnchorElement).download)).toEqual(['Team.ICS', 'calendar.ics'])
		})
	})
})
