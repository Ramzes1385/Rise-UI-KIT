import type { GanttScaleFormat } from '../../types/BaseGanttModel.types'
import {
	addMonths,
	computeRange,
	dayOffset,
	parseGanttDate,
	pxPerDay,
	scaleCells,
	shiftByUnit,
	startOfUnit,
	toGanttDate,
} from '../../model/calendar/ganttCalendar'

const at = (month: number, day: number, year = 2026): Date => new Date(year, month - 1, day)
const DAY = { scale: 'day', firstDay: 1 } as const
const format: GanttScaleFormat = (date, unit) => `${unit}:${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`

describe('ganttCalendar', () => {
	describe('parseGanttDate', () => {
		it('разбирает строку и Date до полуночи', () => {
			expect(parseGanttDate('2026-10-05')).toEqual(at(10, 5))
			expect(parseGanttDate('2026-10-05T18:30')).toEqual(at(10, 5))
			expect(parseGanttDate(new Date(2026, 9, 5, 23, 59))).toEqual(at(10, 5))
		})

		it('возвращает null для пустого и неверного значения', () => {
			expect(parseGanttDate(undefined)).toBeNull()
			expect(parseGanttDate('не дата')).toBeNull()
			expect(parseGanttDate(new Date(Number.NaN))).toBeNull()
		})
	})

	describe('toGanttDate', () => {
		it('возвращает дату в том же виде, что исходная', () => {
			expect(toGanttDate('2026-10-05', at(10, 9))).toBe('2026-10-09')
			expect(toGanttDate(at(10, 5), at(10, 9))).toEqual(at(10, 9))
		})
	})

	describe('addMonths', () => {
		it('сдвигает на месяцы и не выходит за конец месяца', () => {
			expect(addMonths(at(1, 31), 1)).toEqual(at(2, 28))
			expect(addMonths(at(3, 31), -1)).toEqual(at(2, 28))
			expect(addMonths(at(10, 15), 3)).toEqual(at(1, 15, 2027))
		})
	})

	describe('shiftByUnit', () => {
		it('день, неделя и календарный месяц', () => {
			expect(shiftByUnit(at(10, 5), 'day', 2)).toEqual(at(10, 7))
			expect(shiftByUnit(at(10, 5), 'week', -1)).toEqual(at(9, 28))
			expect(shiftByUnit(at(10, 5), 'month', 1)).toEqual(at(11, 5))
		})
	})

	describe('startOfUnit', () => {
		it('начало дня, недели и месяца', () => {
			expect(startOfUnit(new Date(2026, 9, 7, 15), 'day', 1)).toEqual(at(10, 7))
			expect(startOfUnit(at(10, 7), 'week', 1)).toEqual(at(10, 5))
			expect(startOfUnit(at(10, 7), 'week', 0)).toEqual(at(10, 4))
			expect(startOfUnit(at(10, 7), 'month', 1)).toEqual(at(10, 1))
		})
	})

	describe('pxPerDay', () => {
		it('делит ширину столбца на дни в нём', () => {
			expect(pxPerDay('day', 36)).toBe(36)
			expect(pxPerDay('week', 98)).toBe(14)
			expect(pxPerDay('month', 90)).toBe(3)
		})
	})

	describe('computeRange', () => {
		it('без задач — вокруг сегодняшнего дня', () => {
			const range = computeRange([], at(10, 14), DAY)
			expect(range.start).toEqual(at(10, 12))
			expect(range.days).toBe(5)
		})

		it('шкала day: запас в два дня с обеих сторон', () => {
			const range = computeRange([{ start: at(10, 5), end: at(10, 9) }], at(10, 14), DAY)
			expect(range.start).toEqual(at(10, 3))
			expect(range.days).toBe(9)
		})

		it('шкала week: границы по началу недели', () => {
			const range = computeRange([{ start: at(10, 7), end: at(10, 9) }], at(10, 14), { scale: 'week', firstDay: 1 })
			expect(range.start).toEqual(at(9, 28))
			expect(range.days % 7).toBe(0)
			expect(dayOffset(range, at(10, 9))).toBeLessThan(range.days)
		})

		it('шкала month: границы по месяцам', () => {
			const range = computeRange([{ start: at(10, 7), end: at(10, 9) }], at(10, 14), { scale: 'month', firstDay: 1 })
			expect(range.start).toEqual(at(9, 1))
			expect(range.days).toBe(30 + 31 + 30)
		})

		it('учитывает все задачи', () => {
			const range = computeRange(
				[
					{ start: at(10, 20), end: at(10, 21) },
					{ start: at(10, 5), end: at(10, 6) },
					{ start: at(10, 10), end: at(10, 30) },
				],
				at(10, 14),
				DAY,
			)
			expect(range.start).toEqual(at(10, 3))
			expect(dayOffset(range, at(10, 30))).toBe(27)
			expect(range.days).toBe(30)
		})
	})

	describe('dayOffset', () => {
		it('считает календарные дни от начала диапазона', () => {
			expect(dayOffset({ start: at(10, 1), days: 40 }, at(10, 11))).toBe(10)
			expect(dayOffset({ start: at(10, 10), days: 40 }, at(10, 5))).toBe(-5)
		})
	})

	describe('scaleCells', () => {
		it('день: ячейка на день, сверху месяцы с обрезкой по диапазону', () => {
			const { top, bottom } = scaleCells({ start: at(9, 29), days: 5 }, DAY, format)
			expect(bottom.map(cell => [cell.offset, cell.span, cell.label])).toEqual([
				[0, 1, 'day:29.9.2026'],
				[1, 1, 'day:30.9.2026'],
				[2, 1, 'day:1.10.2026'],
				[3, 1, 'day:2.10.2026'],
				[4, 1, 'day:3.10.2026'],
			])
			expect(top.map(cell => [cell.offset, cell.span, cell.label])).toEqual([
				[0, 2, 'monthYear:29.9.2026'],
				[2, 3, 'monthYear:1.10.2026'],
			])
		})

		it('неделя: ячейка на семь дней', () => {
			const { bottom } = scaleCells({ start: at(9, 28), days: 14 }, { scale: 'week', firstDay: 1 }, format)
			expect(bottom.map(cell => [cell.offset, cell.span])).toEqual([
				[0, 7],
				[7, 7],
			])
		})

		it('месяц: ячейки по календарным месяцам, сверху годы', () => {
			const { top, bottom } = scaleCells({ start: at(11, 1), days: 30 + 31 + 31 }, { scale: 'month', firstDay: 1 }, format)
			expect(bottom.map(cell => [cell.span, cell.label])).toEqual([
				[30, 'month:1.11.2026'],
				[31, 'month:1.12.2026'],
				[31, 'month:1.1.2027'],
			])
			expect(top.map(cell => [cell.offset, cell.span, cell.label])).toEqual([
				[0, 61, 'year:1.11.2026'],
				[61, 31, 'year:1.1.2027'],
			])
		})
	})
})
