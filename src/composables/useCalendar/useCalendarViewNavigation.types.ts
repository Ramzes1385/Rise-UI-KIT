import type { CalendarView } from './useCalendar.types'
import type { Ref } from 'vue'

export interface UseCalendarViewNavigationOptions {
	currentMonth: Ref<number>
	currentYear: Ref<number>
	currentView: Ref<CalendarView>
	minDate: () => Date | null
	maxDate: () => Date | null
	disableFrom: () => Date | null
	disableTo: () => Date | null
}
