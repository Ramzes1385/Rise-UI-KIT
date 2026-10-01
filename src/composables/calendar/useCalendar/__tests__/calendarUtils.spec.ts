import { ref } from 'vue'
import type { CalendarView } from '../types/useCalendar.types'
import type { CalendarDayMarkerOptions } from '../types/calendarUtils.types'
import {
	buildMonthDays,
	buildYearRange,
	createDayMarkers,
	getMonthNames,
	getWeekdayNames,
	hasNextMonth,
	hasPrevMonth,
	orderWeekdays,
	shiftCalendarView,
} from '../calendarUtils'

function markerOptions(overrides: Partial<CalendarDayMarkerOptions> = {}): CalendarDayMarkerOptions {
	return {
		disabledDates: () => [],
		disabledWeekdays: () => [],
		minDate: () => null,
		maxDate: () => null,
		disableFrom: () => null,
		disableTo: () => null,
		highlights: () => [],
		weekends: () => null,
		...overrides,
	}
}

function viewState(year: number, month: number, view: CalendarView = 'days') {
	return { currentYear: ref(year), currentMonth: ref(month), currentView: ref<CalendarView>(view) }
}

describe('calendarUtils', () => {
	describe('Названия', () => {
		it('должен вернуть 12 названий месяцев в локали', () => {
			const names = getMonthNames('ru')
			expect(names).toHaveLength(12)
			expect(names[0]).toMatch(/январ/i)
			expect(names[11]).toMatch(/декабр/i)
		})

		it('должен вернуть дни недели начиная с воскресенья', () => {
			const names = getWeekdayNames('en')
			expect(names).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
		})

		it('должен сдвинуть дни недели на первый день недели', () => {
			expect(orderWeekdays(['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'], 1)).toEqual(['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'])
		})

		it('должен построить 12 лет: 5 до года и 6 после', () => {
			expect(buildYearRange(2024)).toEqual([2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030])
		})
	})

	describe('buildMonthDays', () => {
		it('должен построить 42 дня с хвостами соседних месяцев', () => {
			const days = buildMonthDays({ year: 2024, month: 0 }, 1)
			expect(days).toHaveLength(42)
			expect(days[0]).toEqual(new Date(2024, 0, 1))
			expect(days[30]).toEqual(new Date(2024, 0, 31))
			expect(days[41]).toEqual(new Date(2024, 1, 11))
		})

		it('должен взять хвост декабря предыдущего года, когда месяц начинается не с первого дня недели', () => {
			const days = buildMonthDays({ year: 2024, month: 0 }, 0)
			expect(days[0]).toEqual(new Date(2023, 11, 31))
			expect(days[1]).toEqual(new Date(2024, 0, 1))
		})

		it('должен перейти на январь следующего года после декабря', () => {
			const days = buildMonthDays({ year: 2023, month: 11 }, 1)
			expect(days[0]).toEqual(new Date(2023, 10, 27))
			expect(days[41]).toEqual(new Date(2024, 0, 7))
		})
	})

	describe('hasPrevMonth / hasNextMonth', () => {
		const noLimits = { minDate: () => null, disableTo: () => null, maxDate: () => null, disableFrom: () => null }

		it('должен разрешить переход без границ', () => {
			expect(hasPrevMonth({ year: 2024, month: 0 }, noLimits)).toBe(true)
			expect(hasNextMonth({ year: 2024, month: 11 }, noLimits)).toBe(true)
		})

		it('должен запретить переход назад, если minDate или disableTo позже конца предыдущего месяца', () => {
			expect(hasPrevMonth({ year: 2024, month: 0 }, { ...noLimits, minDate: () => new Date(2024, 0, 1) })).toBe(false)
			expect(hasPrevMonth({ year: 2024, month: 0 }, { ...noLimits, disableTo: () => new Date(2024, 0, 5) })).toBe(false)
			expect(hasPrevMonth({ year: 2024, month: 0 }, { ...noLimits, minDate: () => new Date(2023, 11, 31) })).toBe(true)
		})

		it('должен запретить переход вперёд, если maxDate или disableFrom раньше начала следующего месяца', () => {
			expect(hasNextMonth({ year: 2023, month: 11 }, { ...noLimits, maxDate: () => new Date(2023, 11, 31) })).toBe(false)
			expect(hasNextMonth({ year: 2023, month: 11 }, { ...noLimits, disableFrom: () => new Date(2023, 11, 20) })).toBe(false)
			expect(hasNextMonth({ year: 2023, month: 11 }, { ...noLimits, maxDate: () => new Date(2024, 0, 1) })).toBe(true)
		})
	})

	describe('shiftCalendarView', () => {
		it('должен шагать по месяцам в виде дней с переходом через год', () => {
			const back = viewState(2024, 0)
			shiftCalendarView(back, -1)
			expect([back.currentYear.value, back.currentMonth.value]).toEqual([2023, 11])

			const forward = viewState(2023, 11)
			shiftCalendarView(forward, 1)
			expect([forward.currentYear.value, forward.currentMonth.value]).toEqual([2024, 0])

			const inside = viewState(2024, 5)
			shiftCalendarView(inside, 1)
			expect([inside.currentYear.value, inside.currentMonth.value]).toEqual([2024, 6])
		})

		it('должен шагать на год в виде месяцев и на 12 лет в виде лет', () => {
			const months = viewState(2024, 5, 'months')
			shiftCalendarView(months, -1)
			expect(months.currentYear.value).toBe(2023)
			expect(months.currentMonth.value).toBe(5)

			const years = viewState(2024, 5, 'years')
			shiftCalendarView(years, 1)
			expect(years.currentYear.value).toBe(2036)
		})
	})

	describe('createDayMarkers', () => {
		it('должен отключить день из списка и пропустить пустые элементы списка', () => {
			const markers = createDayMarkers(markerOptions({ disabledDates: () => [null as unknown as Date, new Date(2024, 0, 10, 15)] }))
			expect(markers.isDayDisabled(new Date(2024, 0, 10))).toBe(true)
			expect(markers.isDayDisabled(new Date(2024, 0, 11))).toBe(false)
		})

		it('должен отключить день недели', () => {
			const markers = createDayMarkers(markerOptions({ disabledWeekdays: () => [0] }))
			expect(markers.isDayDisabled(new Date(2024, 0, 7))).toBe(true)
			expect(markers.isDayDisabled(new Date(2024, 0, 8))).toBe(false)
		})

		it('должен учесть границы: minDate и maxDate исключают только дни за ними, disableFrom и disableTo — и сам день', () => {
			const day = new Date(2024, 0, 10)
			const disabled = (overrides: Partial<CalendarDayMarkerOptions>) => createDayMarkers(markerOptions(overrides)).isDayDisabled(day)

			expect(disabled({ minDate: () => new Date(2024, 0, 10, 23) })).toBe(false)
			expect(disabled({ minDate: () => new Date(2024, 0, 11) })).toBe(true)
			expect(disabled({ maxDate: () => new Date(2024, 0, 10) })).toBe(false)
			expect(disabled({ maxDate: () => new Date(2024, 0, 9) })).toBe(true)
			expect(disabled({ disableFrom: () => new Date(2024, 0, 10) })).toBe(true)
			expect(disabled({ disableFrom: () => new Date(2024, 0, 11) })).toBe(false)
			expect(disabled({ disableTo: () => new Date(2024, 0, 10) })).toBe(true)
			expect(disabled({ disableTo: () => new Date(2024, 0, 9) })).toBe(false)
		})

		it('должен не читать границы, если день уже отключён списком', () => {
			const minDate = vi.fn(() => null)
			const markers = createDayMarkers(markerOptions({ disabledWeekdays: () => [3], minDate }))
			expect(markers.isDayDisabled(new Date(2024, 0, 10))).toBe(true)
			expect(minDate).not.toHaveBeenCalled()
		})

		it('должен вернуть выходной по дню недели и по празднику', () => {
			const markers = createDayMarkers(markerOptions({ weekends: () => ({ days: [6], holidays: [new Date(2024, 0, 1)] }) }))
			expect(markers.isWeekend(new Date(2024, 0, 6))).toBe(true)
			expect(markers.isWeekend(new Date(2024, 0, 1))).toBe(true)
			expect(markers.isWeekend(new Date(2024, 0, 2))).toBe(false)
			expect(createDayMarkers(markerOptions()).isWeekend(new Date(2024, 0, 6))).toBe(false)
		})

		it('должен вернуть подсветку и события дня', () => {
			const highlights = [
				{ date: new Date(2024, 0, 5), label: 'A' },
				{ date: new Date(2024, 0, 5), label: 'B' },
			]
			const markers = createDayMarkers(markerOptions({ highlights: () => highlights }))
			expect(markers.getHighlight(new Date(2024, 0, 5))?.label).toBe('A')
			expect(markers.getEvents(new Date(2024, 0, 5))).toHaveLength(2)
			expect(markers.getEvents(new Date(2024, 0, 6))).toEqual([])

			const empty = createDayMarkers(markerOptions({ highlights: () => null as unknown as [] }))
			expect(empty.getHighlight(new Date(2024, 0, 5))).toBeUndefined()
			expect(empty.getEvents(new Date(2024, 0, 5))).toEqual([])
		})
	})
})
