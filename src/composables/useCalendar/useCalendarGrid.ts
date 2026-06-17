import { CALENDAR_GRID_CELLS } from '@constants'
import { computed, type Ref } from 'vue'

import { daysInMonth, getWeekNumber, getWeekday } from '@utils/dateUtils'
import type { CalendarView, CalendarWeekday } from './useCalendar.types'

interface UseCalendarGridOptions {
	currentMonth: Ref<number>
	currentYear: Ref<number>
	currentView: Ref<CalendarView>
	locale: () => string
	firstDayOfWeek: () => CalendarWeekday
	showYear?: () => boolean | undefined
}

/**
 * Composable для вычисления сетки дней календаря, названий месяцев, дней недели и диапазонов годов.
 */
function useCalendarGrid(options: UseCalendarGridOptions) {
	const { currentMonth, currentYear, currentView, locale, firstDayOfWeek, showYear } = options

	const monthNames = computed<string[]>(() => {
		const formatter = new Intl.DateTimeFormat(locale(), { month: 'long' })
		const names: string[] = []
		for (let i = 0; i < 12; i++) {
			const d = new Date(2000, i, 1)
			names.push(formatter.format(d))
		}
		return names
	})

	const weekdayNames = computed<string[]>(() => {
		const formatter = new Intl.DateTimeFormat(locale(), { weekday: 'short' })
		const names: string[] = []
		const base = new Date(2023, 0, 1)
		for (let i = 0; i < 7; i++) {
			const d = new Date(base)
			d.setDate(d.getDate() + i)
			names.push(formatter.format(d))
		}
		return names
	})

	const headerTitle = computed((): string => {
		if (currentView.value === 'days') {
			const month = monthNames.value[currentMonth.value]
			return showYear?.() !== false ? `${month} ${currentYear.value}` : month
		}
		if (currentView.value === 'months') {
			return `${currentYear.value}`
		}
		return `${currentYear.value - 5} – ${currentYear.value + 6}`
	})

	const orderedWeekdays = computed<string[]>(() => {
		const names = weekdayNames.value
		const offset = firstDayOfWeek()
		const result: string[] = []
		for (let i = 0; i < 7; i++) {
			result.push(names[(i + offset) % 7])
		}
		return result
	})

	const calendarDays = computed<Date[]>(() => {
		const days: Date[] = []
		const total = daysInMonth(currentYear.value, currentMonth.value)
		const firstDay = new Date(currentYear.value, currentMonth.value, 1)
		let startWeekday = getWeekday(firstDay) - firstDayOfWeek()
		if (startWeekday < 0) startWeekday += 7

		const prevMonth = currentMonth.value === 0 ? 11 : currentMonth.value - 1
		const prevYear = currentMonth.value === 0 ? currentYear.value - 1 : currentYear.value
		const prevTotal = daysInMonth(prevYear, prevMonth)
		for (let i = startWeekday - 1; i >= 0; i--) {
			days.push(new Date(prevYear, prevMonth, prevTotal - i))
		}

		for (let d = 1; d <= total; d++) {
			days.push(new Date(currentYear.value, currentMonth.value, d))
		}

		const remaining = CALENDAR_GRID_CELLS - days.length
		const nextMonth = currentMonth.value === 11 ? 0 : currentMonth.value + 1
		const nextYear = currentMonth.value === 11 ? currentYear.value + 1 : currentYear.value
		for (let d = 1; d <= remaining; d++) {
			days.push(new Date(nextYear, nextMonth, d))
		}

		return days
	})

	const yearRange = computed<number[]>(() => {
		const years: number[] = []
		const start = currentYear.value - 5
		for (let i = 0; i < 12; i++) {
			years.push(start + i)
		}
		return years
	})

	function getRowWeekNumber(rowStartIdx: number): number {
		const days = calendarDays.value
		const midIdx = Math.min(rowStartIdx + 3, days.length - 1)
		return getWeekNumber(days[midIdx])
	}

	return {
		monthNames,
		weekdayNames,
		headerTitle,
		orderedWeekdays,
		calendarDays,
		yearRange,
		getRowWeekNumber,
	}
}

export { useCalendarGrid }
export type { UseCalendarGridOptions }
