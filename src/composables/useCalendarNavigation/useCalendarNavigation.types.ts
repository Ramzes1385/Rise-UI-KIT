import type { useCalendar } from '../useCalendar'
import type { useCalendarPopover } from '../useCalendarPopover'
import type { CalendarSelectionMode, CalendarView } from '@components/BaseCalendar'

export type Calendar = ReturnType<typeof useCalendar>
export type Popover = ReturnType<typeof useCalendarPopover>

export interface UseCalendarNavigationOptions {
	calendar: Calendar
	popover: Popover
	getSelectionMode: () => CalendarSelectionMode
	getShowTime: () => boolean
	getIsDisabled: () => boolean
	getShowDatePopover: () => boolean
	isAm: { value: boolean }
	emit: {
		(event: 'month-change', month: number): void
		(event: 'year-change', year: number): void
		(event: 'view-change', view: CalendarView): void
		(event: 'date-click', date: Date): void
		(event: 'update:modelValue', value: Date | null): void
		(event: 'update:modelValueEnd', value: Date | null): void
		(event: 'update:selectedDates', value: Date[]): void
		(event: 'range-select', start: Date, end: Date): void
	}
}
