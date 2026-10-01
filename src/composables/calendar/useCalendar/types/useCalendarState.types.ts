import type { Ref } from 'vue'
import type { CalendarView } from './useCalendar.types'

/** Состояние календаря: видимый месяц и вид, время и выбранные значения */
export interface CalendarState {
	currentMonth: Ref<number>
	currentYear: Ref<number>
	currentView: Ref<CalendarView>
	hours: Ref<number>
	minutes: Ref<number>
	seconds: Ref<number>
	internalValue: Ref<Date | null>
	internalValueEnd: Ref<Date | null>
	internalSelectedDates: Ref<Date[]>
}
