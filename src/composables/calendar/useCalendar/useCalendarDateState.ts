import { isSameDay, toDateOnly } from '@utils/data/dateUtils'
/** Composable: управление выбором дат календаря — диапазон, отключённые даты, подсветки */
import { createDayMarkers, resolveToday } from './calendarUtils'
import type { UseCalendarDateStateOptions } from './types/useCalendarDateState.types'

function useCalendarDateState(options: UseCalendarDateStateOptions) {
	const { internalValue, internalValueEnd, internalSelectedDates, currentMonth, currentYear, selectionMode } = options

	function isToday(date: Date): boolean {
		return isSameDay(date, resolveToday(options))
	}

	function isSelected(date: Date): boolean {
		if (internalValue.value && isSameDay(date, internalValue.value)) return true
		if (internalValueEnd.value && isSameDay(date, internalValueEnd.value)) return true
		return internalSelectedDates.value.some(item => isSameDay(date, item))
	}

	function isInRange(date: Date): boolean {
		if (!internalValue.value || !internalValueEnd.value) return false
		const d = toDateOnly(date)
		return d > toDateOnly(internalValue.value) && d < toDateOnly(internalValueEnd.value)
	}

	function isRangeStart(date: Date): boolean {
		return !!internalValue.value && isSameDay(date, internalValue.value) && selectionMode() === 'range'
	}

	function isRangeEnd(date: Date): boolean {
		return !!internalValueEnd.value && isSameDay(date, internalValueEnd.value) && selectionMode() === 'range'
	}

	function isOutOfRange(date: Date): boolean {
		if (selectionMode() !== 'range') return false
		if (!internalValue.value || !internalValueEnd.value) return false
		return !isSelected(date) && !isInRange(date) && isCurrentMonth(date)
	}

	function isCurrentMonth(date: Date): boolean {
		return date.getMonth() === currentMonth.value && date.getFullYear() === currentYear.value
	}

	const { isDayDisabled, isWeekend, getHighlight, getEvents } = createDayMarkers(options)

	return {
		isToday,
		isSelected,
		isInRange,
		isRangeStart,
		isRangeEnd,
		isOutOfRange,
		isDayDisabled,
		isWeekend,
		getHighlight,
		getEvents,
		isCurrentMonth,
	}
}

export { useCalendarDateState }
