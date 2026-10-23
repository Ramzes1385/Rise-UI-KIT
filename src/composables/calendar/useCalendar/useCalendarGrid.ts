/** Composable: вычисление сетки дней календаря, названий месяцев, дней недели и диапазонов годов */
import { computed } from 'vue'
import { getWeekNumber } from '@utils/data/dateUtils'
import type { UseCalendarGridOptions } from './types/useCalendarGrid.types'
import { getMonthNames, getWeekdayNames } from '@utils/data/dateFormatUtils'
import { buildMonthDays, buildYearRange, orderWeekdays } from './calendarUtils'

function useCalendarGrid(options: UseCalendarGridOptions) {
	const { currentMonth, currentYear, currentView, locale, firstDayOfWeek, showYear } = options

	const monthNames = computed<string[]>(() => getMonthNames(locale()))

	const weekdayNames = computed<string[]>(() => getWeekdayNames(locale()))

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

	const orderedWeekdays = computed<string[]>(() => orderWeekdays(weekdayNames.value, firstDayOfWeek()))

	const calendarDays = computed<Date[]>(() => buildMonthDays({ year: currentYear.value, month: currentMonth.value }, firstDayOfWeek()))

	const yearRange = computed<number[]>(() => buildYearRange(currentYear.value))

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
