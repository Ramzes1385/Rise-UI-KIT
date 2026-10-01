/** Composable: управление состоянием календаря — навигация, переключение вида, выбор дат */
import { useCalendarGrid } from './useCalendarGrid'
import { useCalendarState } from './useCalendarState'
import { useCalendarDateState } from './useCalendarDateState'
import type { UseCalendarOptions } from './types/useCalendar.types'
import type { CalendarState } from './types/useCalendarState.types'
import { useCalendarViewNavigation } from './useCalendarViewNavigation'
import { buildDateWithTime as buildDateWithTimeUtil, getWeekNumber, isSameDay } from '@utils/data/dateUtils'

function createSelectionActions(state: CalendarState) {
	const { hours, minutes, seconds, internalValue, internalValueEnd, internalSelectedDates } = state

	function setSingleValue(date: Date | null): void {
		internalValue.value = date
	}

	function setRangeStart(date: Date | null): void {
		internalValue.value = date
	}

	function setRangeEnd(date: Date | null): void {
		internalValueEnd.value = date
	}

	function toggleMultipleDate(date: Date): void {
		const idx = internalSelectedDates.value.findIndex(item => isSameDay(item, date))
		if (idx > -1) {
			internalSelectedDates.value.splice(idx, 1)
		} else {
			internalSelectedDates.value.push(date)
		}
	}

	function buildDateWithTime(date: Date): Date {
		return buildDateWithTimeUtil({
			date,
			hours: hours.value,
			minutes: minutes.value,
			seconds: seconds.value,
		})
	}

	return { setSingleValue, setRangeStart, setRangeEnd, toggleMultipleDate, buildDateWithTime }
}

function useCalendar(options: UseCalendarOptions) {
	const state = useCalendarState(options)
	const grid = useCalendarGrid({ ...options, ...state })
	const dateState = useCalendarDateState({ ...options, ...state })
	const navigation = useCalendarViewNavigation({ ...options, ...state })

	return {
		...state,
		...grid,
		...dateState,
		...navigation,
		...createSelectionActions(state),
		getWeekNumber,
		isSameDay,
	}
}

export { useCalendar }
