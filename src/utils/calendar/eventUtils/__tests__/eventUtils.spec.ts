import { parseRecurrenceRule } from '../../recurrenceUtils/recurrenceUtils'
import type { CalendarEvent, NormalizedCalendarEvent } from '../types/eventUtils.types'
import {
	addDays,
	daysBetween,
	getEventsInRange,
	groupByDay,
	layoutDay,
	layoutWeek,
	normalizeEvent,
	parseEventDate,
	startOfDay,
	startOfWeek,
	toDayKey,
} from '../eventUtils'

/** Местная дата: месяц с 1, как в записи `ГГГГ-ММ-ДД` */
const at = ([year, month, day, hours = 0, minutes = 0, seconds = 0]: number[]): Date =>
	new Date(year, month - 1, day, hours, minutes, seconds)

const normalized = (event: Omit<CalendarEvent, 'title'> & { title?: string }): NormalizedCalendarEvent => {
	const item = normalizeEvent({ title: String(event.id), ...event })
	if (!item) throw new Error(`событие ${event.id} не разобрано`)
	return item
}

const keys = (items: readonly { key: string }[]): string[] => items.map(item => item.key)

describe('eventUtils', () => {
	describe('parseEventDate', () => {
		it('день без времени — полночь по местному времени и isDateOnly', () => {
			expect(parseEventDate('2026-10-02')).toEqual({ date: at([2026, 10, 2]), isDateOnly: true })
		})

		it('дата со временем без пояса — местное время, с секундами и без, через T и пробел', () => {
			expect(parseEventDate('2026-10-02T10:30')).toEqual({ date: at([2026, 10, 2, 10, 30]), isDateOnly: false })
			expect(parseEventDate('2026-10-02 10:30:15')).toEqual({ date: at([2026, 10, 2, 10, 30, 15]), isDateOnly: false })
		})

		it('ISO-строка с поясом — точный момент', () => {
			expect(parseEventDate('2026-10-02T07:00:00Z')?.date.getTime()).toBe(Date.UTC(2026, 9, 2, 7))
			expect(parseEventDate('2026-10-02T10:00:00+03:00')?.date.getTime()).toBe(Date.UTC(2026, 9, 2, 7))
		})

		it('Date — копия, а не та же ссылка', () => {
			const source = at([2026, 10, 2, 9])
			const parsed = parseEventDate(source)
			expect(parsed).toEqual({ date: source, isDateOnly: false })
			expect(parsed?.date).not.toBe(source)
		})

		it('неверная строка и неверный Date — null', () => {
			expect(parseEventDate('не дата')).toBeNull()
			expect(parseEventDate(new Date('x'))).toBeNull()
		})
	})

	describe('normalizeEvent', () => {
		it('неверное начало — null', () => {
			expect(normalizeEvent({ id: 1, title: 'A', start: 'завтра' })).toBeNull()
		})

		it('день без времени — событие на весь день, без конца — один день', () => {
			expect(normalizeEvent({ id: 1, title: 'A', start: '2026-10-02' })).toMatchObject({
				key: '1',
				start: at([2026, 10, 2]),
				end: at([2026, 10, 3]),
				allDay: true,
			})
		})

		it('событие со временем без конца — час', () => {
			expect(normalizeEvent({ id: 'a', title: 'A', start: '2026-10-02T10:00' })).toMatchObject({
				start: at([2026, 10, 2, 10]),
				end: at([2026, 10, 2, 11]),
				allDay: false,
			})
		})

		it('конец раньше начала или неверный — конец по умолчанию', () => {
			expect(normalizeEvent({ id: 1, title: 'A', start: '2026-10-02T10:00', end: '2026-10-02T09:00' })?.end).toEqual(
				at([2026, 10, 2, 11]),
			)
			expect(normalizeEvent({ id: 1, title: 'A', start: '2026-10-02T10:00', end: '2026-10-02T10:00' })?.end).toEqual(
				at([2026, 10, 2, 11]),
			)
			expect(normalizeEvent({ id: 1, title: 'A', start: '2026-10-02', end: 'потом' })?.end).toEqual(at([2026, 10, 3]))
		})

		it('allDay по флагу: начало — полночь, конец со временем округляется вверх до полуночи', () => {
			expect(normalizeEvent({ id: 1, title: 'A', start: '2026-10-02T10:00', end: '2026-10-03T09:00', allDay: true })).toMatchObject({
				start: at([2026, 10, 2]),
				end: at([2026, 10, 4]),
				allDay: true,
			})
		})

		it('конец allDay в полночь не входит в событие: 2–3 октября — end 4 октября', () => {
			expect(normalizeEvent({ id: 1, title: 'A', start: '2026-10-02', end: '2026-10-04' })?.end).toEqual(at([2026, 10, 4]))
		})

		it('allDay: false у дня без времени — событие со временем от полуночи', () => {
			expect(normalizeEvent({ id: 1, title: 'A', start: '2026-10-02', allDay: false })).toMatchObject({
				start: at([2026, 10, 2]),
				end: at([2026, 10, 2, 1]),
				allDay: false,
			})
		})
	})

	describe('даты', () => {
		it('startOfDay — полночь того же дня', () => {
			expect(startOfDay(at([2026, 10, 2, 17, 45]))).toEqual(at([2026, 10, 2]))
		})

		it('startOfWeek — с понедельника и с воскресенья', () => {
			expect(startOfWeek(at([2026, 10, 2, 15]), 1)).toEqual(at([2026, 9, 28]))
			expect(startOfWeek(at([2026, 10, 2]), 0)).toEqual(at([2026, 9, 27]))
			expect(startOfWeek(at([2026, 9, 28]), 1)).toEqual(at([2026, 9, 28]))
			expect(startOfWeek(at([2026, 9, 27]), 1)).toEqual(at([2026, 9, 21]))
		})

		it('addDays и daysBetween — по календарю, через месяц и год', () => {
			expect(addDays(at([2026, 12, 30, 10, 15]), 3)).toEqual(at([2027, 1, 2, 10, 15]))
			expect(addDays(at([2026, 3, 1]), -1)).toEqual(at([2026, 2, 28]))
			expect(daysBetween(at([2026, 10, 2, 23]), at([2026, 10, 3, 1]))).toBe(1)
			expect(daysBetween(at([2026, 10, 7]), at([2026, 10, 1]))).toBe(-6)
		})

		it('toDayKey — ГГГГ-ММ-ДД по местному времени с нулями', () => {
			expect(toDayKey(at([2026, 3, 5, 23, 59]))).toBe('2026-03-05')
		})

		describe('переход на летнее время (Europe/Berlin)', () => {
			const savedTz = process.env.TZ ?? Intl.DateTimeFormat().resolvedOptions().timeZone
			beforeEach(() => {
				process.env.TZ = 'Europe/Berlin'
			})
			afterEach(() => {
				process.env.TZ = savedTz
			})

			it('addDays сохраняет полночь и время суток, daysBetween считает сутки по 23 и 25 часов за день', () => {
				const spring = addDays(at([2026, 3, 28]), 2)
				expect(spring).toEqual(at([2026, 3, 30]))
				expect(spring.getHours()).toBe(0)
				expect(addDays(at([2026, 3, 28, 10]), 1).getHours()).toBe(10)
				expect(daysBetween(at([2026, 3, 29]), at([2026, 3, 30]))).toBe(1)
				const autumn = addDays(at([2026, 10, 24]), 2)
				expect(autumn.getHours()).toBe(0)
				expect(daysBetween(at([2026, 10, 25]), at([2026, 10, 26]))).toBe(1)
			})

			it('ежедневный повтор держит то же время суток через переход', () => {
				const items = getEventsInRange([{ id: 'd', title: 'D', start: '2026-03-28T09:00', rrule: 'FREQ=DAILY;COUNT=3' }], {
					start: at([2026, 3, 1]),
					end: at([2026, 4, 1]),
				})
				expect(items.map(item => item.start.getHours())).toEqual([9, 9, 9])
				expect(items.map(item => item.start.getDate())).toEqual([28, 29, 30])
			})
		})
	})

	describe('getEventsInRange', () => {
		const october = { start: at([2026, 10, 1]), end: at([2026, 11, 1]) }

		it('только пересекающие период; конец периода и конец события не входят', () => {
			const events: CalendarEvent[] = [
				{ id: 'before', title: 'B', start: '2026-09-30' },
				{ id: 'edge', title: 'E', start: '2026-09-30T23:00', end: '2026-10-01T00:00' },
				{ id: 'cross', title: 'C', start: '2026-09-30T23:00', end: '2026-10-01T01:00' },
				{ id: 'in', title: 'I', start: '2026-10-15' },
				{ id: 'after', title: 'A', start: '2026-11-01' },
				{ id: 'bad', title: 'X', start: 'нет' },
			]
			expect(keys(getEventsInRange(events, october))).toEqual(['cross', 'in'])
		})

		it('сортировка: раньше начало, при равном — длиннее, при равных — весь день выше', () => {
			const events: CalendarEvent[] = [
				{ id: 'short', title: 'S', start: '2026-10-02T00:00', end: '2026-10-02T01:00' },
				{ id: 'timed-day', title: 'T', start: '2026-10-02T00:00', end: '2026-10-03T00:00' },
				{ id: 'all-day', title: 'A', start: '2026-10-02' },
				{ id: 'long', title: 'L', start: '2026-10-02', end: '2026-10-05' },
				{ id: 'first', title: 'F', start: '2026-10-01T12:00' },
			]
			expect(keys(getEventsInRange(events, october))).toEqual(['first', 'long', 'all-day', 'timed-day', 'short'])
		})

		it('повтор строкой: только повторы в периоде, ключ id@мс, исходное событие сохраняется', () => {
			const event: CalendarEvent = {
				id: 7,
				title: 'Планёрка',
				start: '2026-09-01T10:00',
				end: '2026-09-01T10:30',
				rrule: 'FREQ=WEEKLY',
			}
			const items = getEventsInRange([event], { start: at([2026, 10, 5]), end: at([2026, 10, 19]) })
			expect(keys(items)).toEqual([`7@${at([2026, 10, 6, 10]).getTime()}`, `7@${at([2026, 10, 13, 10]).getTime()}`])
			expect(items[0]).toMatchObject({ event, start: at([2026, 10, 6, 10]), end: at([2026, 10, 6, 10, 30]), allDay: false })
		})

		it('повтор объектом и пропуски: неверные даты пропусков игнорируются', () => {
			const rule = parseRecurrenceRule('FREQ=DAILY;COUNT=4')
			const items = getEventsInRange(
				[{ id: 'r', title: 'R', start: '2026-10-01', rrule: rule ?? undefined, exdates: ['2026-10-02', 'плохая дата'] }],
				october,
			)
			expect(items.map(item => item.start.getDate())).toEqual([1, 3, 4])
			expect(items.every(item => item.allDay)).toBe(true)
		})

		it('неверная строка повтора — обычное событие', () => {
			const items = getEventsInRange([{ id: 'x', title: 'X', start: '2026-10-02', rrule: 'INTERVAL=2' }], october)
			expect(keys(items)).toEqual(['x'])
		})

		it('повтор, начавшийся до периода, не даёт событий вне периода', () => {
			const items = getEventsInRange([{ id: 'y', title: 'Y', start: '2020-01-01T08:00', rrule: 'FREQ=DAILY' }], {
				start: at([2026, 10, 1]),
				end: at([2026, 10, 4]),
			})
			expect(items.map(item => item.start)).toEqual([at([2026, 10, 1, 8]), at([2026, 10, 2, 8]), at([2026, 10, 3, 8])])
		})
	})

	describe('layoutWeek', () => {
		const weekStart = at([2026, 9, 28])

		it('обрезка по неделе, isStart/isEnd и первый свободный ряд', () => {
			const items = [
				normalized({ id: 'vacation', start: '2026-09-25', end: '2026-10-06' }),
				normalized({ id: 'meeting', start: '2026-09-28T10:00' }),
				normalized({ id: 'trip', start: '2026-09-29', end: '2026-10-01' }),
				normalized({ id: 'late', start: '2026-10-04T20:00', end: '2026-10-06T10:00' }),
				normalized({ id: 'next', start: '2026-10-05' }),
			]
			expect(layoutWeek(items, weekStart).map(({ item, ...rest }) => ({ key: item.key, ...rest }))).toEqual([
				{ key: 'vacation', column: 0, span: 7, lane: 0, isStart: false, isEnd: false },
				{ key: 'meeting', column: 0, span: 1, lane: 1, isStart: true, isEnd: true },
				{ key: 'trip', column: 1, span: 2, lane: 1, isStart: true, isEnd: true },
				{ key: 'late', column: 6, span: 1, lane: 1, isStart: true, isEnd: false },
			])
		})

		it('строка из одного дня — только события этого дня', () => {
			const items = [normalized({ id: 'a', start: '2026-10-01', end: '2026-10-04' }), normalized({ id: 'b', start: '2026-10-03' })]
			expect(layoutWeek(items, at([2026, 10, 2]), 1)).toEqual([
				{ item: items[0], column: 0, span: 1, lane: 0, isStart: false, isEnd: false },
			])
		})
	})

	describe('layoutDay', () => {
		const day = at([2026, 10, 2])

		it('пересечения: 10–11, 10:30–12, 11–12 → колонки 0, 1, 0 из 2; отдельная группа — своя', () => {
			const items = [
				normalized({ id: 'a', start: '2026-10-02T10:00', end: '2026-10-02T11:00' }),
				normalized({ id: 'b', start: '2026-10-02T10:30', end: '2026-10-02T12:00' }),
				normalized({ id: 'c', start: '2026-10-02T11:00', end: '2026-10-02T12:00' }),
				normalized({ id: 'd', start: '2026-10-02T13:00', end: '2026-10-02T14:00' }),
			]
			expect(layoutDay(items, day).map(segment => [segment.item.key, segment.column, segment.columns])).toEqual([
				['a', 0, 2],
				['b', 1, 2],
				['c', 0, 2],
				['d', 0, 1],
			])
			expect(layoutDay(items, day)[0]).toMatchObject({ top: 600 / 1440, height: 60 / 1440 })
		})

		it('при равном начале длинное событие левее', () => {
			const items = [
				normalized({ id: 'short', start: '2026-10-02T09:00', end: '2026-10-02T09:30' }),
				normalized({ id: 'long', start: '2026-10-02T09:00', end: '2026-10-02T11:00' }),
				normalized({ id: 'same', start: '2026-10-02T09:00', end: '2026-10-02T09:30' }),
			]
			expect(layoutDay(items, day).map(segment => [segment.item.key, segment.column, segment.columns])).toEqual([
				['long', 0, 3],
				['short', 1, 3],
				['same', 2, 3],
			])
		})

		it('без событий на весь день и событий других дней', () => {
			const items = [normalized({ id: 'all', start: '2026-10-02' }), normalized({ id: 'other', start: '2026-10-03T10:00' })]
			expect(layoutDay(items, day)).toEqual([])
		})

		it('событие через полночь режется по дням', () => {
			const night = normalized({ id: 'night', start: '2026-10-02T22:00', end: '2026-10-03T02:00' })
			expect(layoutDay([night], day)[0]).toMatchObject({
				top: 1320 / 1440,
				height: 120 / 1440,
				isContinued: false,
				isContinuing: true,
			})
			expect(layoutDay([night], at([2026, 10, 3, 15]))[0]).toMatchObject({
				top: 0,
				height: 120 / 1440,
				isContinued: true,
				isContinuing: false,
			})
		})

		it('видимая шкала: обрезка по окну, события вне окна не показываются', () => {
			const items = [
				normalized({ id: 'early', start: '2026-10-02T06:00', end: '2026-10-02T07:00' }),
				normalized({ id: 'edge', start: '2026-10-02T07:30', end: '2026-10-02T09:00' }),
				normalized({ id: 'late', start: '2026-10-02T19:00', end: '2026-10-02T21:00' }),
			]
			const segments = layoutDay(items, day, { startMinute: 480, endMinute: 1200 })
			expect(segments.map(segment => segment.item.key)).toEqual(['edge', 'late'])
			expect(segments[0]).toMatchObject({ top: 0, height: 60 / 720 })
			expect(segments[1]).toMatchObject({ top: 660 / 720, height: 60 / 720 })
		})

		it('событие короче минуты занимает минуту', () => {
			const tiny = normalized({ id: 'tiny', start: at([2026, 10, 2, 10]), end: at([2026, 10, 2, 10, 0, 20]) })
			expect(layoutDay([tiny], day)[0].height).toBe(1 / 1440)
		})
	})

	describe('groupByDay', () => {
		it('многодневное событие — в каждом своём дне, пустых дней нет', () => {
			const items = [
				normalized({ id: 'trip', start: '2026-10-02', end: '2026-10-04' }),
				normalized({ id: 'call', start: '2026-10-05T09:00' }),
				normalized({ id: 'outside', start: '2026-11-03' }),
			]
			const days = groupByDay(items, { start: at([2026, 10, 1, 12]), end: at([2026, 11, 1]) })
			expect(days.map(entry => [toDayKey(entry.date), keys(entry.items)])).toEqual([
				['2026-10-02', ['trip']],
				['2026-10-03', ['trip']],
				['2026-10-05', ['call']],
			])
		})

		it('без событий — пустой список', () => {
			expect(groupByDay([], { start: at([2026, 10, 1]), end: at([2026, 11, 1]) })).toEqual([])
		})
	})
})
