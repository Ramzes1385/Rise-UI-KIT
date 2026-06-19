import type { CalendarHighlight } from '@components/BaseCalendar/model/BaseCalendar.types'
import type { ComputedRef, Ref } from 'vue'

export interface UseCalendarPopoverOptions {
	getEvents: (date: Date) => CalendarHighlight[]
	isCurrentMonth: (date: Date) => boolean
	isToday: (date: Date) => boolean
	isSelected: (date: Date) => boolean
	isInRange: (date: Date) => boolean
	isWeekend: (date: Date) => boolean
	isDayDisabled: (date: Date) => boolean
	isRangeStart: (date: Date) => boolean
	isRangeEnd: (date: Date) => boolean
	isOutOfRange: (date: Date) => boolean
}

export interface UseCalendarPopoverReturn {
	popoverDate: Ref<Date | null>
	popoverStyle: Ref<Record<string, string>>
	popoverHighlights: ComputedRef<CalendarHighlight[]>
	closePopover: () => void
	dayClasses: (date: Date, isCustomSlot: boolean) => Record<string, boolean>
}
