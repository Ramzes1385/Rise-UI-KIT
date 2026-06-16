import type { Ref } from 'vue'

import { getWeekday, isSameDay, toDateOnly } from '@utils/dateUtils'
import type { CalendarHighlight, CalendarSelectionMode, CalendarWeekday, CalendarWeekends } from './useCalendar.types'

interface UseCalendarDateStateOptions {
	internalValue: Ref<Date | null>
	internalValueEnd: Ref<Date | null>
	internalSelectedDates: Ref<Date[]>
	currentMonth: Ref<number>
	currentYear: Ref<number>
	selectionMode: () => CalendarSelectionMode
	disabledDates: () => Date[]
	disabledWeekdays: () => CalendarWeekday[]
	minDate: () => Date | null
	maxDate: () => Date | null
	disableFrom: () => Date | null
	disableTo: () => Date | null
	highlights: () => CalendarHighlight[]
	weekends: () => CalendarWeekends | null
}

function useCalendarDateState(options: UseCalendarDateStateOptions) {
	const {
		internalValue,
		internalValueEnd,
		internalSelectedDates,
		currentMonth,
		currentYear,
		selectionMode,
		disabledDates,
		disabledWeekdays,
		minDate,
		maxDate,
		disableFrom,
		disableTo,
		highlights,
		weekends,
	} = options

	function isToday(date: Date): boolean {
		return isSameDay(date, new Date())
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

	function isDayDisabled(date: Date): boolean {
		const dateOnly = toDateOnly(date)
		const dateTs = dateOnly.getTime()

		const disabled = disabledDates()
		if (Array.isArray(disabled)) {
			for (const dis of disabled) {
				if (dis && isSameDay(dateOnly, new Date(dis))) return true
			}
		}

		const weekdays = disabledWeekdays()
		if (Array.isArray(weekdays) && weekdays.includes(getWeekday(dateOnly) as CalendarWeekday)) return true

		const min = minDate()
		if (min && dateTs < toDateOnly(new Date(min)).getTime()) return true

		const max = maxDate()
		if (max && dateTs > toDateOnly(new Date(max)).getTime()) return true

		const from = disableFrom()
		if (from && dateTs >= toDateOnly(new Date(from)).getTime()) return true

		const to = disableTo()
		if (to && dateTs <= toDateOnly(new Date(to)).getTime()) return true

		return false
	}

	function isWeekend(date: Date): boolean {
		const w = weekends()
		if (!w) return false
		const day = getWeekday(date)
		if (w.days.includes(day as CalendarWeekday)) return true
		return w.holidays.some(h => isSameDay(date, h))
	}

	function getHighlight(date: Date): CalendarHighlight | undefined {
		const hls = highlights()
		if (!Array.isArray(hls)) return undefined
		return hls.find(h => isSameDay(date, new Date(h.date)))
	}

	function getEvents(date: Date): CalendarHighlight[] {
		const hls = highlights()
		if (!Array.isArray(hls)) return []
		return hls.filter(h => isSameDay(date, new Date(h.date)))
	}

	function isCurrentMonth(date: Date): boolean {
		return date.getMonth() === currentMonth.value && date.getFullYear() === currentYear.value
	}

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
export type { UseCalendarDateStateOptions }
