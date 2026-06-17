import '@testing-library/jest-dom/vitest'
import { nextTick, ref } from 'vue'
import { useCalendar } from './useCalendar'
import type { CalendarWeekday, UseCalendarOptions } from './useCalendar.types'

/** Фабрика опций по умолчанию */
function createOptions(overrides: Partial<UseCalendarOptions> = {}): UseCalendarOptions {
	return {
		selectionMode: () => 'single',
		modelValue: () => null,
		modelValueEnd: () => null,
		selectedDates: () => [],
		minDate: () => null,
		maxDate: () => null,
		disabledDates: () => [],
		disabledWeekdays: () => [],
		disableFrom: () => null,
		disableTo: () => null,
		highlights: () => [],
		weekends: () => null,
		firstDayOfWeek: () => 1 as CalendarWeekday,
		locale: () => 'ru',
		...overrides,
	}
}

describe('useCalendar', () => {
	describe('Начальное состояние', () => {
		it('должен установить текущий месяц и год когда нет initialMonth/initialYear', () => {
			const now = new Date()
			const cal = useCalendar(createOptions())

			expect(cal.currentMonth.value).toBe(now.getMonth())
			expect(cal.currentYear.value).toBe(now.getFullYear())
		})

		it('должен использовать initialMonth и initialYear когда переданы', () => {
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 5,
					initialYear: () => 2025,
				}),
			)

			expect(cal.currentMonth.value).toBe(5)
			expect(cal.currentYear.value).toBe(2025)
		})

		it('должен установить текущий вид days по умолчанию', () => {
			const cal = useCalendar(createOptions())

			expect(cal.currentView.value).toBe('days')
		})
	})

	describe('Навигация по месяцам', () => {
		it('должен перейти к следующему месяцу', () => {
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 0,
					initialYear: () => 2025,
				}),
			)

			cal.nextMonth()

			expect(cal.currentMonth.value).toBe(1)
			expect(cal.currentYear.value).toBe(2025)
		})

		it('должен перейти к январю следующего года когда текущий декабрь', () => {
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 11,
					initialYear: () => 2025,
				}),
			)

			cal.nextMonth()

			expect(cal.currentMonth.value).toBe(0)
			expect(cal.currentYear.value).toBe(2026)
		})

		it('должен перейти к предыдущему месяцу', () => {
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 5,
					initialYear: () => 2025,
				}),
			)

			cal.prevMonth()

			expect(cal.currentMonth.value).toBe(4)
			expect(cal.currentYear.value).toBe(2025)
		})

		it('должен перейти к декабрю предыдущего года когда текущий январь', () => {
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 0,
					initialYear: () => 2025,
				}),
			)

			cal.prevMonth()

			expect(cal.currentMonth.value).toBe(11)
			expect(cal.currentYear.value).toBe(2024)
		})

		it('должен перейти к сегодняшней дате через goToToday', () => {
			const now = new Date()
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 0,
					initialYear: () => 2020,
				}),
			)

			cal.goToToday()

			expect(cal.currentMonth.value).toBe(now.getMonth())
			expect(cal.currentYear.value).toBe(now.getFullYear())
			expect(cal.currentView.value).toBe('days')
		})
	})

	describe('Навигация по видам', () => {
		it('должен переключиться с days на months через switchView', () => {
			const cal = useCalendar(createOptions())

			cal.switchView()

			expect(cal.currentView.value).toBe('months')
		})

		it('должен переключиться с months на years через switchView', () => {
			const cal = useCalendar(createOptions())

			cal.switchView()
			cal.switchView()

			expect(cal.currentView.value).toBe('years')
		})

		it('должен выбрать месяц и вернуться к виду days', () => {
			const cal = useCalendar(createOptions())

			cal.switchView()
			cal.selectMonth(3)

			expect(cal.currentMonth.value).toBe(3)
			expect(cal.currentView.value).toBe('days')
		})

		it('должен выбрать год и вернуться к виду months', () => {
			const cal = useCalendar(createOptions())

			cal.switchView()
			cal.switchView()
			cal.selectYear(2030)

			expect(cal.currentYear.value).toBe(2030)
			expect(cal.currentView.value).toBe('months')
		})

		it('должен уменьшить год на 1 в виде months через prevMonth', () => {
			const cal = useCalendar(
				createOptions({
					initialYear: () => 2025,
				}),
			)

			cal.switchView()
			cal.prevMonth()

			expect(cal.currentYear.value).toBe(2024)
		})

		it('должен увеличить год на 1 в виде months через nextMonth', () => {
			const cal = useCalendar(
				createOptions({
					initialYear: () => 2025,
				}),
			)

			cal.switchView()
			cal.nextMonth()

			expect(cal.currentYear.value).toBe(2026)
		})

		it('должен уменьшить год на 12 в виде years через prevMonth', () => {
			const cal = useCalendar(
				createOptions({
					initialYear: () => 2025,
				}),
			)

			cal.switchView()
			cal.switchView()
			cal.prevMonth()

			expect(cal.currentYear.value).toBe(2013)
		})

		it('должен увеличить год на 12 в виде years через nextMonth', () => {
			const cal = useCalendar(
				createOptions({
					initialYear: () => 2025,
				}),
			)

			cal.switchView()
			cal.switchView()
			cal.nextMonth()

			expect(cal.currentYear.value).toBe(2037)
		})
	})

	describe('canPrev / canNext', () => {
		it('должен запретить prev когда minDate позже конца предыдущего месяца', () => {
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 5,
					initialYear: () => 2025,
					minDate: () => new Date(2025, 5, 15),
				}),
			)

			expect(cal.canPrev.value).toBe(false)
		})

		it('должен разрешить prev когда minDate раньше конца предыдущего месяца', () => {
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 5,
					initialYear: () => 2025,
					minDate: () => new Date(2025, 3, 1),
				}),
			)

			expect(cal.canPrev.value).toBe(true)
		})

		it('должен запретить next когда maxDate раньше начала следующего месяца', () => {
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 5,
					initialYear: () => 2025,
					maxDate: () => new Date(2025, 5, 15),
				}),
			)

			expect(cal.canNext.value).toBe(false)
		})

		it('должен разрешить next когда maxDate позже начала следующего месяца', () => {
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 5,
					initialYear: () => 2025,
					maxDate: () => new Date(2025, 7, 1),
				}),
			)

			expect(cal.canNext.value).toBe(true)
		})

		it('не должен переходить когда canPrev=false', () => {
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 5,
					initialYear: () => 2025,
					minDate: () => new Date(2025, 5, 15),
				}),
			)

			cal.prevMonth()

			expect(cal.currentMonth.value).toBe(5)
		})

		it('не должен переходить когда canNext=false', () => {
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 5,
					initialYear: () => 2025,
					maxDate: () => new Date(2025, 5, 15),
				}),
			)

			cal.nextMonth()

			expect(cal.currentMonth.value).toBe(5)
		})
	})

	describe('Сетка календаря', () => {
		it('должен содержать 42 дня в calendarDays', () => {
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 0,
					initialYear: () => 2025,
				}),
			)

			expect(cal.calendarDays.value).toHaveLength(42)
		})

		it('должен включать дни предыдущего месяца в начале сетки', () => {
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 0,
					initialYear: () => 2025,
					firstDayOfWeek: () => 1 as CalendarWeekday,
				}),
			)

			const firstDay = cal.calendarDays.value[0]
			expect(firstDay.getMonth()).toBe(11)
			expect(firstDay.getFullYear()).toBe(2024)
		})

		it('должен включать дни следующего месяца в конце сетки', () => {
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 0,
					initialYear: () => 2025,
				}),
			)

			const lastDay = cal.calendarDays.value[41]
			expect(lastDay.getMonth()).toBe(1)
		})

		it('должен учитывать firstDayOfWeek при формировании сетки', () => {
			const calMonday = useCalendar(
				createOptions({
					initialMonth: () => 0,
					initialYear: () => 2025,
					firstDayOfWeek: () => 1 as CalendarWeekday,
				}),
			)

			const calSunday = useCalendar(
				createOptions({
					initialMonth: () => 0,
					initialYear: () => 2025,
					firstDayOfWeek: () => 0 as CalendarWeekday,
				}),
			)

			expect(calMonday.calendarDays.value[0]).not.toEqual(calSunday.calendarDays.value[0])
		})
	})

	describe('Заголовок', () => {
		it('должен показывать месяц и год в виде days', () => {
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 5,
					initialYear: () => 2025,
					locale: () => 'ru',
				}),
			)

			const title = cal.headerTitle.value
			expect(title).toContain('2025')
		})

		it('должен показывать только год в виде months', () => {
			const cal = useCalendar(
				createOptions({
					initialYear: () => 2025,
				}),
			)

			cal.switchView()

			expect(cal.headerTitle.value).toBe('2025')
		})

		it('должен показывать диапазон лет в виде years', () => {
			const cal = useCalendar(
				createOptions({
					initialYear: () => 2025,
				}),
			)

			cal.switchView()
			cal.switchView()

			expect(cal.headerTitle.value).toBe('2020 – 2031')
		})

		it('должен скрывать год когда showYear=false', () => {
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 5,
					initialYear: () => 2025,
					showYear: () => false,
				}),
			)

			const title = cal.headerTitle.value
			expect(title).not.toContain('2025')
		})
	})

	describe('Выбор даты — single', () => {
		it('должен выбрать дату через setSingleValue', () => {
			const cal = useCalendar(
				createOptions({
					selectionMode: () => 'single',
				}),
			)
			const date = new Date(2025, 5, 15)

			cal.setSingleValue(date)

			expect(cal.isSelected(date)).toBe(true)
		})

		it('должен сбросить выбор через setSingleValue(null)', () => {
			const cal = useCalendar(
				createOptions({
					selectionMode: () => 'single',
				}),
			)
			const date = new Date(2025, 5, 15)

			cal.setSingleValue(date)
			cal.setSingleValue(null)

			expect(cal.isSelected(date)).toBe(false)
		})
	})

	describe('Выбор даты — range', () => {
		it('должен определить начало диапазона', () => {
			const cal = useCalendar(
				createOptions({
					selectionMode: () => 'range',
				}),
			)
			const start = new Date(2025, 5, 10)

			cal.setRangeStart(start)

			expect(cal.isRangeStart(start)).toBe(true)
		})

		it('должен определить конец диапазона', () => {
			const cal = useCalendar(
				createOptions({
					selectionMode: () => 'range',
				}),
			)
			const end = new Date(2025, 5, 20)

			cal.setRangeEnd(end)

			expect(cal.isRangeEnd(end)).toBe(true)
		})

		it('должен определить дату внутри диапазона', () => {
			const cal = useCalendar(
				createOptions({
					selectionMode: () => 'range',
				}),
			)
			const start = new Date(2025, 5, 10)
			const end = new Date(2025, 5, 20)
			const middle = new Date(2025, 5, 15)

			cal.setRangeStart(start)
			cal.setRangeEnd(end)

			expect(cal.isInRange(middle)).toBe(true)
		})

		it('не должен считать дату в диапазоне когда нет конца', () => {
			const cal = useCalendar(
				createOptions({
					selectionMode: () => 'range',
				}),
			)
			const start = new Date(2025, 5, 10)
			const middle = new Date(2025, 5, 15)

			cal.setRangeStart(start)

			expect(cal.isInRange(middle)).toBe(false)
		})

		it('не должен считать дату в диапазоне когда она за границами', () => {
			const cal = useCalendar(
				createOptions({
					selectionMode: () => 'range',
				}),
			)
			const start = new Date(2025, 5, 10)
			const end = new Date(2025, 5, 20)
			const outside = new Date(2025, 5, 25)

			cal.setRangeStart(start)
			cal.setRangeEnd(end)

			expect(cal.isInRange(outside)).toBe(false)
		})

		it('не должен считать isRangeStart когда режим не range', () => {
			const cal = useCalendar(
				createOptions({
					selectionMode: () => 'single',
				}),
			)
			const start = new Date(2025, 5, 10)

			cal.setSingleValue(start)

			expect(cal.isRangeStart(start)).toBe(false)
		})
	})

	describe('Выбор даты — multiple', () => {
		it('должен добавить дату через toggleMultipleDate', () => {
			const cal = useCalendar(
				createOptions({
					selectionMode: () => 'multiple',
				}),
			)
			const date = new Date(2025, 5, 15)

			cal.toggleMultipleDate(date)

			expect(cal.isSelected(date)).toBe(true)
		})

		it('должен убрать дату при повторном toggle', () => {
			const cal = useCalendar(
				createOptions({
					selectionMode: () => 'multiple',
				}),
			)
			const date = new Date(2025, 5, 15)

			cal.toggleMultipleDate(date)
			cal.toggleMultipleDate(date)

			expect(cal.isSelected(date)).toBe(false)
		})
	})

	describe('Отключённые даты', () => {
		it('должен отключить дату из списка disabledDates', () => {
			const disabled = new Date(2025, 5, 15)
			const cal = useCalendar(
				createOptions({
					disabledDates: () => [disabled],
				}),
			)

			expect(cal.isDayDisabled(disabled)).toBe(true)
		})

		it('не должен отключать дату вне списка disabledDates', () => {
			const disabled = new Date(2025, 5, 15)
			const other = new Date(2025, 5, 16)
			const cal = useCalendar(
				createOptions({
					disabledDates: () => [disabled],
				}),
			)

			expect(cal.isDayDisabled(other)).toBe(false)
		})

		it('должен отключить день недели из disabledWeekdays', () => {
			const cal = useCalendar(
				createOptions({
					disabledWeekdays: () => [0, 6] as CalendarWeekday[],
				}),
			)
			const sunday = new Date(2025, 0, 5)

			expect(cal.isDayDisabled(sunday)).toBe(true)
		})

		it('должен отключить дату раньше minDate', () => {
			const cal = useCalendar(
				createOptions({
					minDate: () => new Date(2025, 5, 10),
				}),
			)
			const before = new Date(2025, 5, 5)

			expect(cal.isDayDisabled(before)).toBe(true)
		})

		it('не должен отключать дату равную minDate', () => {
			const minDate = new Date(2025, 5, 10)
			const cal = useCalendar(
				createOptions({
					minDate: () => minDate,
				}),
			)

			expect(cal.isDayDisabled(minDate)).toBe(false)
		})

		it('должен отключить дату позже maxDate', () => {
			const cal = useCalendar(
				createOptions({
					maxDate: () => new Date(2025, 5, 20),
				}),
			)
			const after = new Date(2025, 5, 25)

			expect(cal.isDayDisabled(after)).toBe(true)
		})

		it('не должен отключать дату равную maxDate', () => {
			const maxDate = new Date(2025, 5, 20)
			const cal = useCalendar(
				createOptions({
					maxDate: () => maxDate,
				}),
			)

			expect(cal.isDayDisabled(maxDate)).toBe(false)
		})

		it('должен отключить дату начиная с disableFrom', () => {
			const cal = useCalendar(
				createOptions({
					disableFrom: () => new Date(2025, 5, 20),
				}),
			)
			const from = new Date(2025, 5, 20)

			expect(cal.isDayDisabled(from)).toBe(true)
		})

		it('должен отключить дату до disableTo', () => {
			const cal = useCalendar(
				createOptions({
					disableTo: () => new Date(2025, 5, 10),
				}),
			)
			const to = new Date(2025, 5, 5)

			expect(cal.isDayDisabled(to)).toBe(true)
		})
	})

	describe('Выходные', () => {
		it('должен определить выходной по дню недели', () => {
			const cal = useCalendar(
				createOptions({
					weekends: () => ({ days: [0, 6] as CalendarWeekday[], holidays: [] }),
				}),
			)
			const sunday = new Date(2025, 0, 5)

			expect(cal.isWeekend(sunday)).toBe(true)
		})

		it('должен определить праздничный день', () => {
			const holiday = new Date(2025, 0, 1)
			const cal = useCalendar(
				createOptions({
					weekends: () => ({ days: [] as CalendarWeekday[], holidays: [holiday] }),
				}),
			)

			expect(cal.isWeekend(holiday)).toBe(true)
		})

		it('не должен считать выходным обычный день', () => {
			const cal = useCalendar(
				createOptions({
					weekends: () => ({ days: [0, 6] as CalendarWeekday[], holidays: [] }),
				}),
			)
			const wednesday = new Date(2025, 0, 8)

			expect(cal.isWeekend(wednesday)).toBe(false)
		})

		it('должен вернуть false когда weekends=null', () => {
			const cal = useCalendar(
				createOptions({
					weekends: () => null,
				}),
			)

			expect(cal.isWeekend(new Date(2025, 0, 5))).toBe(false)
		})
	})

	describe('Выделения и события', () => {
		it('должен вернуть выделение для даты', () => {
			const date = new Date(2025, 5, 15)
			const cal = useCalendar(
				createOptions({
					highlights: () => [{ date, label: 'Встреча', color: '#ff0' }],
				}),
			)

			const highlight = cal.getHighlight(date)
			expect(highlight?.label).toBe('Встреча')
		})

		it('должен вернуть undefined когда нет выделения', () => {
			const cal = useCalendar(
				createOptions({
					highlights: () => [],
				}),
			)

			expect(cal.getHighlight(new Date(2025, 5, 15))).toBeUndefined()
		})

		it('должен вернуть события для даты', () => {
			const date = new Date(2025, 5, 15)
			const cal = useCalendar(
				createOptions({
					highlights: () => [
						{ date, label: 'Встреча 1' },
						{ date, label: 'Встреча 2' },
					],
				}),
			)

			const events = cal.getEvents(date)
			expect(events).toHaveLength(2)
		})
	})

	describe('Вспомогательные методы', () => {
		it('должен определить текущий месяц через isCurrentMonth', () => {
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 5,
					initialYear: () => 2025,
				}),
			)

			expect(cal.isCurrentMonth(new Date(2025, 5, 10))).toBe(true)
			expect(cal.isCurrentMonth(new Date(2025, 4, 10))).toBe(false)
		})

		it('должен определить сегодняшний день через isToday', () => {
			const cal = useCalendar(createOptions())
			const now = new Date()

			expect(cal.isToday(now)).toBe(true)
		})

		it('должен вернуть диапазон лет в yearRange', () => {
			const cal = useCalendar(
				createOptions({
					initialYear: () => 2025,
				}),
			)

			const years = cal.yearRange.value
			expect(years).toHaveLength(12)
			expect(years[0]).toBe(2020)
			expect(years[11]).toBe(2031)
		})

		it('должен собрать дату с временем через buildDateWithTime', () => {
			const cal = useCalendar(createOptions())
			cal.hours.value = 14
			cal.minutes.value = 30
			cal.seconds.value = 0

			const result = cal.buildDateWithTime(new Date(2025, 5, 15))

			expect(result.getHours()).toBe(14)
			expect(result.getMinutes()).toBe(30)
		})
	})

	describe('Синхронизация с modelValue', () => {
		it('должен синхронизировать internalValue с modelValue', () => {
			const date = new Date(2025, 5, 15)
			const cal = useCalendar(
				createOptions({
					modelValue: () => date,
				}),
			)

			expect(cal.internalValue.value).not.toBeNull()
		})

		it('должен синхронизировать internalValueEnd с modelValueEnd', () => {
			const date = new Date(2025, 5, 20)
			const cal = useCalendar(
				createOptions({
					modelValueEnd: () => date,
				}),
			)

			expect(cal.internalValueEnd.value).not.toBeNull()
		})

		it('должен синхронизировать internalSelectedDates с selectedDates', () => {
			const dates = [new Date(2025, 5, 10), new Date(2025, 5, 15)]
			const cal = useCalendar(
				createOptions({
					selectedDates: () => dates,
				}),
			)

			expect(cal.internalSelectedDates.value).toHaveLength(2)
		})
	})

	describe('isOutOfRange', () => {
		it('не должен помечать дату как outOfRange когда режим не range', () => {
			const cal = useCalendar(
				createOptions({
					selectionMode: () => 'single',
				}),
			)

			expect(cal.isOutOfRange(new Date(2025, 5, 15))).toBe(false)
		})

		it('не должен помечать дату как outOfRange когда нет конца диапазона', () => {
			const cal = useCalendar(
				createOptions({
					selectionMode: () => 'range',
				}),
			)
			cal.setRangeStart(new Date(2025, 5, 10))

			expect(cal.isOutOfRange(new Date(2025, 5, 15))).toBe(false)
		})
	})

	describe('Навигация через год', () => {
		it('должен перейти к предыдущему году при навигации из января', () => {
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 0,
					initialYear: () => 2025,
				}),
			)

			cal.prevMonth()

			expect(cal.currentMonth.value).toBe(11)
			expect(cal.currentYear.value).toBe(2024)
		})
	})

	describe('Views', () => {
		it('должен переключить вид на months и выбрать месяц', () => {
			const cal = useCalendar(createOptions())

			expect(cal.currentView.value).toBe('days')

			cal.switchView()
			expect(cal.currentView.value).toBe('months')

			cal.selectMonth(5)
			expect(cal.currentMonth.value).toBe(5)
			expect(cal.currentView.value).toBe('days')
		})

		it('должен переключить вид на years и выбрать год', () => {
			const cal = useCalendar(createOptions())

			cal.switchView() // days → months
			cal.switchView() // months → years
			expect(cal.currentView.value).toBe('years')

			cal.selectYear(2026)
			expect(cal.currentYear.value).toBe(2026)
			expect(cal.currentView.value).toBe('months')
		})
	})

	describe('Multiple selection', () => {
		it('должен добавлять и удалять даты в multiple режиме', () => {
			const cal = useCalendar(
				createOptions({
					selectionMode: () => 'multiple',
				}),
			)

			const date1 = new Date(2025, 0, 10)
			const date2 = new Date(2025, 0, 15)

			cal.toggleMultipleDate(date1)
			expect(cal.internalSelectedDates.value).toHaveLength(1)

			cal.toggleMultipleDate(date2)
			expect(cal.internalSelectedDates.value).toHaveLength(2)

			// Повторный клик убирает дату
			cal.toggleMultipleDate(date1)
			expect(cal.internalSelectedDates.value).toHaveLength(1)
		})
	})

	describe('isDayDisabled', () => {
		it('должен блокировать дату после disableFrom', () => {
			const cal = useCalendar(
				createOptions({
					disableFrom: () => new Date(2025, 0, 15),
				}),
			)

			expect(cal.isDayDisabled(new Date(2025, 0, 20))).toBe(true)
			expect(cal.isDayDisabled(new Date(2025, 0, 10))).toBe(false)
		})

		it('должен блокировать дату до disableTo', () => {
			const cal = useCalendar(
				createOptions({
					disableTo: () => new Date(2025, 0, 10),
				}),
			)

			expect(cal.isDayDisabled(new Date(2025, 0, 5))).toBe(true)
			expect(cal.isDayDisabled(new Date(2025, 0, 15))).toBe(false)
		})
	})

	describe('getHighlight / getEvents — не-массив highlights', () => {
		it('getHighlight должен вернуть undefined когда highlights не массив', () => {
			const cal = useCalendar(
				createOptions({
					highlights: () => null as unknown as [],
				}),
			)

			expect(cal.getHighlight(new Date(2025, 5, 15))).toBeUndefined()
		})

		it('getEvents должен вернуть [] когда highlights не массив', () => {
			const cal = useCalendar(
				createOptions({
					highlights: () => null as unknown as [],
				}),
			)

			expect(cal.getEvents(new Date(2025, 5, 15))).toEqual([])
		})
	})

	describe('canPrev / canNext с disableTo / disableFrom', () => {
		it('canPrev должен запретить когда disableTo позже конца предыдущего месяца', () => {
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 5,
					initialYear: () => 2025,
					disableTo: () => new Date(2025, 5, 15),
				}),
			)

			expect(cal.canPrev.value).toBe(false)
		})

		it('canNext должен запретить когда disableFrom раньше начала следующего месяца', () => {
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 5,
					initialYear: () => 2025,
					disableFrom: () => new Date(2025, 5, 1),
				}),
			)

			expect(cal.canNext.value).toBe(false)
		})
	})

	describe('isOutOfRange', () => {
		it('должен вернуть true для даты вне диапазона в том же месяце', () => {
			const cal = useCalendar(
				createOptions({
					selectionMode: () => 'range',
					initialMonth: () => 5,
					initialYear: () => 2025,
				}),
			)
			cal.setRangeStart(new Date(2025, 5, 10))
			cal.setRangeEnd(new Date(2025, 5, 12))

			// Дата в том же месяце, но вне диапазона
			expect(cal.isOutOfRange(new Date(2025, 5, 20))).toBe(true)
		})

		it('должен вернуть false для даты в диапазоне', () => {
			const cal = useCalendar(
				createOptions({
					selectionMode: () => 'range',
					initialMonth: () => 5,
					initialYear: () => 2025,
				}),
			)
			cal.setRangeStart(new Date(2025, 5, 10))
			cal.setRangeEnd(new Date(2025, 5, 20))

			expect(cal.isOutOfRange(new Date(2025, 5, 15))).toBe(false)
		})

		it('должен вернуть false когда дата не в текущем месяце', () => {
			const cal = useCalendar(
				createOptions({
					selectionMode: () => 'range',
					initialMonth: () => 5,
					initialYear: () => 2025,
				}),
			)
			cal.setRangeStart(new Date(2025, 5, 10))
			cal.setRangeEnd(new Date(2025, 5, 12))

			// Дата из другого месяца
			expect(cal.isOutOfRange(new Date(2025, 6, 5))).toBe(false)
		})
	})

	describe('watch initialMonth / initialYear', () => {
		it('должен обновить currentMonth когда initialMonth становится определённым', async () => {
			const monthVal = ref<number>()
			const cal = useCalendar(
				createOptions({
					initialMonth: () => monthVal.value,
					initialYear: () => 2025,
				}),
			)

			monthVal.value = 3
			await nextTick()

			expect(cal.currentMonth.value).toBe(3)
		})

		it('должен обновить currentYear когда initialYear становится определённым', async () => {
			// Покрывает ветку watch initialYear (useCalendar.ts:28) — val !== undefined ветвь.
			const yearVal = ref<number>()
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 0,
					initialYear: () => yearVal.value,
				}),
			)

			yearVal.value = 2030
			await nextTick()

			expect(cal.currentYear.value).toBe(2030)
		})
	})

	describe('startWeekday < 0 — firstDayOfWeek', () => {
		it('должен корректировать startWeekday когда он отрицательный', () => {
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 0,
					initialYear: () => 2025,
					firstDayOfWeek: () => 6 as CalendarWeekday,
				}),
			)

			// Календарь должен содержать 42 дня
			expect(cal.calendarDays.value).toHaveLength(42)
		})
	})

	describe('Дополнительные покрытия веток', () => {
		it('watch initialMonth: val === undefined → currentMonth не обновляется', async () => {
			// Покрывает useCalendar.ts:21 (ветка else у `if (val !== undefined)`).
			const monthVal = ref<number | undefined>(3)
			const cal = useCalendar(
				createOptions({
					initialMonth: () => monthVal.value,
					initialYear: () => 2025,
				}),
			)
			expect(cal.currentMonth.value).toBe(3)

			monthVal.value = undefined
			await nextTick()
			// currentMonth не должен сбрасываться при undefined
			expect(cal.currentMonth.value).toBe(3)
		})

		it('watch initialYear: val === undefined → currentYear не обновляется', async () => {
			// Покрывает useCalendar.ts:28 (ветка else у `if (val !== undefined)`).
			const yearVal = ref<number | undefined>(2030)
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 0,
					initialYear: () => yearVal.value,
				}),
			)
			expect(cal.currentYear.value).toBe(2030)

			yearVal.value = undefined
			await nextTick()
			expect(cal.currentYear.value).toBe(2030)
		})

		it('selectedDates: переданное не-массивное значение → пустой массив', () => {
			// Покрывает useCalendar.ts:70 — ветка `: []` у `Array.isArray(val) ? ... : []`.
			const datesVal = ref<unknown>(null)
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 0,
					initialYear: () => 2025,
					selectedDates: () => datesVal.value as Date[],
				}),
			)
			expect(cal.internalSelectedDates.value).toEqual([])
		})

		it('calendarDays: декабрь корректно перетекает в январь следующего года', () => {
			// Покрывает useCalendar.ts:142-143 — `currentMonth.value === 11 ? 0 : ...` и `+1`.
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 11,
					initialYear: () => 2025,
				}),
			)
			expect(cal.calendarDays.value).toHaveLength(42)
			// Последние дни должны быть из следующего месяца (январь 2026)
			const lastDay = cal.calendarDays.value[41]
			expect(lastDay.getFullYear()).toBe(2026)
			expect(lastDay.getMonth()).toBe(0)
		})

		it('isDayDisabled: disabledDates не-массив → пропуск проверки', () => {
			// Покрывает useCalendar.ts:204 — `Array.isArray(disabledDates)` ветка false.
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 0,
					initialYear: () => 2025,
					disabledDates: () => null as unknown as Date[],
				}),
			)
			expect(cal.isDayDisabled(new Date(2025, 0, 15))).toBe(false)
		})

		it("switchView: currentView='years' → ничего не делает", () => {
			// Покрывает useCalendar.ts:358 — ветка else у `else if currentView === 'months'`.
			const cal = useCalendar(
				createOptions({
					initialMonth: () => 0,
					initialYear: () => 2025,
				}),
			)
			cal.switchView() // days → months
			cal.switchView() // months → years
			expect(cal.currentView.value).toBe('years')
			cal.switchView() // years → не меняется
			expect(cal.currentView.value).toBe('years')
		})
	})

	describe('isDayDisabled с disableFrom/disableTo на границе', () => {
		it('должен блокировать дату РАНЬШЕ disableTo на границе', () => {
			const cal = useCalendar(
				createOptions({
					disableTo: () => new Date(2025, 5, 10),
				}),
			)

			// Дата равна disableTo — должна быть заблокирована (dTs <= to)
			expect(cal.isDayDisabled(new Date(2025, 5, 10))).toBe(true)
		})

		it('должен блокировать дату ПОЗЖЕ disableFrom на границе', () => {
			const cal = useCalendar(
				createOptions({
					disableFrom: () => new Date(2025, 5, 10),
				}),
			)

			// Дата равна disableFrom — должна быть заблокирована (dTs >= from)
			expect(cal.isDayDisabled(new Date(2025, 5, 10))).toBe(true)
		})
	})
})
