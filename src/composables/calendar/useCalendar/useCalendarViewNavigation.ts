/** Composable: навигация по календарю — переключение месяцев, лет и видов отображения */
import { computed } from 'vue'
import { hasNextMonth, hasPrevMonth, resolveToday, shiftCalendarView } from './calendarUtils'
import type { UseCalendarViewNavigationOptions } from './types/useCalendarViewNavigation.types'

function useCalendarViewNavigation(options: UseCalendarViewNavigationOptions) {
	const { currentMonth, currentYear, currentView } = options

	const canPrev = computed((): boolean => hasPrevMonth({ year: currentYear.value, month: currentMonth.value }, options))

	const canNext = computed((): boolean => hasNextMonth({ year: currentYear.value, month: currentMonth.value }, options))

	function prevMonth(): void {
		if (!canPrev.value) return
		shiftCalendarView(options, -1)
	}

	function nextMonth(): void {
		if (!canNext.value) return
		shiftCalendarView(options, 1)
	}

	function goToToday(): void {
		const now = resolveToday(options)
		currentMonth.value = now.getMonth()
		currentYear.value = now.getFullYear()
		currentView.value = 'days'
	}

	function switchView(): void {
		if (currentView.value === 'days') {
			currentView.value = 'months'
		} else if (currentView.value === 'months') {
			currentView.value = 'years'
		}
	}

	function selectMonth(month: number): void {
		currentMonth.value = month
		currentView.value = 'days'
	}

	function selectYear(year: number): void {
		currentYear.value = year
		currentView.value = 'months'
	}

	return {
		canPrev,
		canNext,
		prevMonth,
		nextMonth,
		goToToday,
		switchView,
		selectMonth,
		selectYear,
	}
}

export { useCalendarViewNavigation }
