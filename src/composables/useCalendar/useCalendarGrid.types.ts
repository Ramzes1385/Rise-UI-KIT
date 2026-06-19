import type { CalendarView, CalendarWeekday } from './useCalendar.types'
import type { Ref } from 'vue'

export interface UseCalendarGridOptions {
	currentMonth: Ref<number>
	currentYear: Ref<number>
	currentView: Ref<CalendarView>
	locale: () => string
	firstDayOfWeek: () => CalendarWeekday
	showYear?: () => boolean | undefined
}
