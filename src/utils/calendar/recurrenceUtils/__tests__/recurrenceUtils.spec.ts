import type { RecurrenceExpandOptions, RecurrenceRule } from '../types/recurrenceUtils.types'
import { expandRecurrence, formatIcsDate, formatRecurrenceRule, parseIcsDate, parseRecurrenceRule } from '../recurrenceUtils'

/** Местная дата: месяц с 1 */
const at = ([year, month, day, hours = 0, minutes = 0, seconds = 0]: number[]): Date =>
	new Date(year, month - 1, day, hours, minutes, seconds)

const HOUR = 3_600_000

/** Развёртка правила строкой: начало, длительность час, период по умолчанию — с начала на годы вперёд */
function expand(rule: string, start: Date, options: Partial<RecurrenceExpandOptions> = {}): Date[] {
	const parsed = parseRecurrenceRule(rule)
	if (!parsed) throw new Error(`правило не разобрано: ${rule}`)
	return expandRecurrence({
		start,
		end: new Date(start.getTime() + HOUR),
		rule: parsed,
		rangeStart: start,
		rangeEnd: at([2040, 1, 1]),
		...options,
	}).map(item => item.start)
}

describe('recurrenceUtils', () => {
	describe('parseIcsDate', () => {
		it('день, местное время с секундами и без, UTC', () => {
			expect(parseIcsDate('20261002')).toEqual(at([2026, 10, 2]))
			expect(parseIcsDate(' 20261002T103000 ')).toEqual(at([2026, 10, 2, 10, 30]))
			expect(parseIcsDate('20261002T1030')).toEqual(at([2026, 10, 2, 10, 30]))
			expect(parseIcsDate('20261002T070000Z')?.getTime()).toBe(Date.UTC(2026, 9, 2, 7))
		})

		it('неверная запись — null', () => {
			expect(parseIcsDate('2026-10-02')).toBeNull()
			expect(parseIcsDate('')).toBeNull()
		})
	})

	describe('formatIcsDate', () => {
		it('время — в UTC с Z, день — по местному времени', () => {
			expect(formatIcsDate(new Date(Date.UTC(2026, 9, 2, 7, 5, 9)))).toBe('20261002T070509Z')
			expect(formatIcsDate(at([2026, 3, 5, 23]), true)).toBe('20260305')
		})
	})

	describe('parseRecurrenceRule', () => {
		it('префикс RRULE:, регистр, все части и BYDAY с номером', () => {
			expect(parseRecurrenceRule('rrule:freq=weekly;interval=2;byday=2mo,-1fr,+3su;count=10;wkst=su;x-name=1')).toEqual({
				freq: 'WEEKLY',
				interval: 2,
				byDay: [
					{ weekday: 1, nth: 2 },
					{ weekday: 5, nth: -1 },
					{ weekday: 0, nth: 3 },
				],
				count: 10,
				weekStart: 0,
			})
		})

		it('UNTIL: день, местное время и UTC', () => {
			expect(parseRecurrenceRule('FREQ=DAILY;UNTIL=20261231')?.until).toEqual(at([2026, 12, 31]))
			expect(parseRecurrenceRule('FREQ=DAILY;UNTIL=20261231T000000')?.until).toEqual(at([2026, 12, 31]))
			expect(parseRecurrenceRule('FREQ=DAILY;UNTIL=20261231T235959Z')?.until?.getTime()).toBe(Date.UTC(2026, 11, 31, 23, 59, 59))
		})

		it('без FREQ или с неизвестной частотой — null', () => {
			expect(parseRecurrenceRule('INTERVAL=2;COUNT=3')).toBeNull()
			expect(parseRecurrenceRule('FREQ=HOURLY')).toBeNull()
			expect(parseRecurrenceRule('')).toBeNull()
		})

		it('неверные значения частей: INTERVAL ≥ 1, COUNT ≥ 0, остальное отбрасывается', () => {
			expect(parseRecurrenceRule('FREQ=DAILY;INTERVAL=0;COUNT=x;UNTIL=скоро;WKST=XX;BYDAY=ZZ,TU;BYMONTH')).toEqual({
				freq: 'DAILY',
				interval: 1,
				count: 0,
				until: undefined,
				weekStart: undefined,
				byDay: [{ weekday: 2 }],
			})
			expect(parseRecurrenceRule('FREQ=DAILY;INTERVAL=-3;COUNT=-2')).toMatchObject({ interval: 1, count: 0 })
		})
	})

	describe('formatRecurrenceRule', () => {
		it('все части; UNTIL днём для событий на весь день', () => {
			const rule: RecurrenceRule = {
				freq: 'WEEKLY',
				interval: 2,
				byDay: [{ weekday: 1 }, { weekday: 5, nth: -1 }],
				count: 3,
				until: at([2026, 12, 31]),
				weekStart: 0,
			}
			expect(formatRecurrenceRule(rule, true)).toBe('FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,-1FR;COUNT=3;UNTIL=20261231;WKST=SU')
		})

		it('INTERVAL=1 и пустой BYDAY не пишутся, UNTIL со временем — в UTC', () => {
			expect(formatRecurrenceRule({ freq: 'DAILY', interval: 1, byDay: [], until: new Date(Date.UTC(2026, 11, 31, 21)) })).toBe(
				'FREQ=DAILY;UNTIL=20261231T210000Z',
			)
			expect(formatRecurrenceRule({ freq: 'YEARLY' })).toBe('FREQ=YEARLY')
		})

		it('круг: разобрать → записать → разобрать', () => {
			const source = 'FREQ=MONTHLY;INTERVAL=3;BYDAY=2MO,-1FR;COUNT=12;WKST=SU'
			const rule = parseRecurrenceRule(source)
			expect(rule && formatRecurrenceRule(rule)).toBe(source)
		})
	})

	describe('expandRecurrence', () => {
		it('первый повтор — само начало, даже не по BYDAY', () => {
			expect(expand('FREQ=WEEKLY;BYDAY=MO;COUNT=2', at([2026, 10, 1, 9]))).toEqual([at([2026, 10, 1, 9]), at([2026, 10, 5, 9])])
		})

		it('DAILY с INTERVAL и BYDAY-фильтром', () => {
			expect(expand('FREQ=DAILY;INTERVAL=2;COUNT=3', at([2026, 10, 30, 8]))).toEqual([
				at([2026, 10, 30, 8]),
				at([2026, 11, 1, 8]),
				at([2026, 11, 3, 8]),
			])
			expect(expand('FREQ=DAILY;BYDAY=MO,WE;COUNT=3', at([2026, 10, 5]))).toEqual([
				at([2026, 10, 5]),
				at([2026, 10, 7]),
				at([2026, 10, 12]),
			])
		})

		it('WEEKLY: дни после начала в той же неделе, без BYDAY — день начала', () => {
			expect(expand('FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=4', at([2026, 9, 30, 10]))).toEqual([
				at([2026, 9, 30, 10]),
				at([2026, 10, 2, 10]),
				at([2026, 10, 5, 10]),
				at([2026, 10, 7, 10]),
			])
			expect(expand('FREQ=WEEKLY;COUNT=3', at([2026, 10, 2]))).toEqual([at([2026, 10, 2]), at([2026, 10, 9]), at([2026, 10, 16])])
		})

		it('WEEKLY с INTERVAL=2 и WKST — примеры RFC 5545', () => {
			const start = at([1997, 8, 5, 9])
			expect(expand('FREQ=WEEKLY;INTERVAL=2;COUNT=4;BYDAY=TU,SU;WKST=MO', start).map(date => date.getDate())).toEqual([5, 10, 19, 24])
			expect(expand('FREQ=WEEKLY;INTERVAL=2;COUNT=4;BYDAY=TU,SU;WKST=SU', start).map(date => date.getDate())).toEqual([5, 17, 19, 31])
		})

		it('MONTHLY: 31-е пропускает короткие месяцы, COUNT считает только повторы', () => {
			expect(expand('FREQ=MONTHLY;COUNT=5', at([2026, 1, 31]))).toEqual([
				at([2026, 1, 31]),
				at([2026, 3, 31]),
				at([2026, 5, 31]),
				at([2026, 7, 31]),
				at([2026, 8, 31]),
			])
		})

		it('MONTHLY: BYDAY с номером, с конца и UNTIL включительно', () => {
			expect(expand('FREQ=MONTHLY;BYDAY=-1FR,2MO;UNTIL=20261225', at([2026, 10, 1]))).toEqual([
				at([2026, 10, 1]),
				at([2026, 10, 12]),
				at([2026, 10, 30]),
				at([2026, 11, 9]),
				at([2026, 11, 27]),
				at([2026, 12, 14]),
				at([2026, 12, 25]),
			])
		})

		it('MONTHLY: BYDAY без номера — все такие дни месяца; несуществующий номер — только начало', () => {
			expect(expand('FREQ=MONTHLY;BYDAY=TU;COUNT=5', at([2026, 10, 1])).map(date => date.getDate())).toEqual([1, 6, 13, 20, 27])
			expect(expand('FREQ=MONTHLY;BYDAY=6MO', at([2026, 10, 1]), { rangeEnd: at([2027, 1, 1]) })).toEqual([at([2026, 10, 1])])
		})

		it('YEARLY: 29 февраля — только в високосные годы', () => {
			expect(expand('FREQ=YEARLY;COUNT=3', at([2024, 2, 29, 12]))).toEqual([
				at([2024, 2, 29, 12]),
				at([2028, 2, 29, 12]),
				at([2032, 2, 29, 12]),
			])
			expect(expand('FREQ=YEARLY;INTERVAL=2;COUNT=2', at([2026, 10, 2]))).toEqual([at([2026, 10, 2]), at([2028, 10, 2])])
		})

		it('пропуски входят в COUNT; у событий со временем — точное время, у allDay — день', () => {
			const start = at([2026, 10, 1, 10])
			expect(expand('FREQ=DAILY;COUNT=3', start, { exdates: [at([2026, 10, 2, 10]), at([2026, 10, 3, 11])] })).toEqual([
				at([2026, 10, 1, 10]),
				at([2026, 10, 3, 10]),
			])
			expect(expand('FREQ=DAILY;COUNT=3', at([2026, 10, 1]), { exdates: [at([2026, 10, 2, 15])], isAllDay: true })).toEqual([
				at([2026, 10, 1]),
				at([2026, 10, 3]),
			])
		})

		it('только видимый период: повтор, начатый раньше и идущий в периоде, входит; конец периода не входит', () => {
			const start = at([2026, 10, 1, 22])
			const result = expandRecurrence({
				start,
				end: at([2026, 10, 2, 2]),
				rule: { freq: 'DAILY' },
				rangeStart: at([2026, 10, 5]),
				rangeEnd: at([2026, 10, 7, 22]),
			})
			expect(result).toEqual([
				{ start: at([2026, 10, 4, 22]), end: at([2026, 10, 5, 2]) },
				{ start: at([2026, 10, 5, 22]), end: at([2026, 10, 6, 2]) },
				{ start: at([2026, 10, 6, 22]), end: at([2026, 10, 7, 2]) },
			])
		})

		it('период раньше начала — пусто', () => {
			expect(expand('FREQ=DAILY', at([2026, 10, 10]), { rangeStart: at([2026, 10, 1]), rangeEnd: at([2026, 10, 5]) })).toEqual([])
		})

		it.each([
			['FREQ=DAILY;INTERVAL=3', at([2020, 1, 1, 9])],
			['FREQ=WEEKLY;INTERVAL=2;BYDAY=TU,SA;WKST=SU', at([2020, 1, 1, 9])],
			['FREQ=WEEKLY;BYDAY=MO', at([2019, 12, 31, 23])],
		])('перескок дальнего прошлого (%s) даёт те же повторы, что развёртка с начала', (rule, start) => {
			const range = { rangeStart: at([2026, 10, 1]), rangeEnd: at([2026, 11, 1]) }
			const fromStart = expand(rule, start, { rangeEnd: range.rangeEnd }).filter(
				date => date.getTime() + HOUR > range.rangeStart.getTime(),
			)
			const skipped = expand(rule, start, range)
			expect(skipped.length).toBeGreaterThan(0)
			expect(skipped).toEqual(fromStart)
		})
	})
})
