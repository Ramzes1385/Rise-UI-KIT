/** Composable: навигация по календарю — переключение месяцев, лет и видов отображения */
import { computed } from 'vue'
import { toDateOnly } from '@utils/dateUtils'
import type { UseCalendarViewNavigationOptions } from './useCalendarViewNavigation.types'

/**
 * Composable для навигации по календарю: переключение месяцев, лет и видов отображения.
 */
function useCalendarViewNavigation(options: UseCalendarViewNavigationOptions) {
	const { currentMonth, currentYear, currentView, minDate, maxDate, disableFrom, disableTo } = options

	const canPrev = computed((): boolean => {
		const prevM = currentMonth.value === 0 ? 11 : currentMonth.value - 1
		const prevY = currentMonth.value === 0 ? currentYear.value - 1 : currentYear.value
		const lastDayPrev = new Date(prevY, prevM + 1, 0).getTime()

		const min = minDate()
		if (min && toDateOnly(new Date(min)).getTime() > lastDayPrev) return false

		const to = disableTo()
		if (to && toDateOnly(new Date(to)).getTime() > lastDayPrev) return false

		return true
	})

	const canNext = computed((): boolean => {
		const nextM = currentMonth.value === 11 ? 0 : currentMonth.value + 1
		const nextY = currentMonth.value === 11 ? currentYear.value + 1 : currentYear.value
		const firstDayNext = new Date(nextY, nextM, 1).getTime()

		const max = maxDate()
		if (max && toDateOnly(new Date(max)).getTime() < firstDayNext) return false

		const from = disableFrom()
		if (from && toDateOnly(new Date(from)).getTime() < firstDayNext) return false

		return true
	})

	function prevMonth(): void {
		if (!canPrev.value) return
		if (currentView.value === 'days') {
			if (currentMonth.value === 0) {
				currentMonth.value = 11
				currentYear.value--
			} else {
				currentMonth.value--
			}
		} else if (currentView.value === 'months') {
			currentYear.value--
		} else {
			currentYear.value -= 12
		}
	}

	function nextMonth(): void {
		if (!canNext.value) return
		if (currentView.value === 'days') {
			if (currentMonth.value === 11) {
				currentMonth.value = 0
				currentYear.value++
			} else {
				currentMonth.value++
			}
		} else if (currentView.value === 'months') {
			currentYear.value++
		} else {
			currentYear.value += 12
		}
	}

	function goToToday(): void {
		const now = new Date()
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
