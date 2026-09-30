import { heatmapCells, levelOf, toDay } from '../../model/calendar/heatmapCalendar'

describe('календарь активности', () => {
	it('уровни: ноль, четверти от максимума', () => {
		expect([0, 1, 2, 3, 4, 8].map(value => levelOf(value, 8))).toEqual([0, 1, 1, 2, 2, 4])
		expect(levelOf(5, 0)).toBe(0)
	})

	it('первая ячейка — понедельник, последняя — конец периода', () => {
		const cells = heatmapCells([], { end: toDay('2025-05-18'), weeks: 2 })
		expect(cells[0].key).toBe('2025-05-05')
		expect(cells[0].weekday).toBe(0)
		expect(cells[cells.length - 1]).toMatchObject({ key: '2025-05-18', week: 1, weekday: 6 })
	})
})
