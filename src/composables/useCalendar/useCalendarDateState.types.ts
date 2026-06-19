import type { CalendarHighlight, CalendarSelectionMode, CalendarWeekday, CalendarWeekends } from './useCalendar.types'
import type { Ref } from 'vue'

export interface UseCalendarDateStateOptions {
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
