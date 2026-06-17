import { computed, ref } from 'vue'
import type { CalendarHighlight } from './BaseCalendar.types'

interface UseCalendarPopoverOptions {
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

interface UseCalendarPopoverReturn {
	popoverDate: ReturnType<typeof ref<Date | null>>
	popoverStyle: ReturnType<typeof ref<Record<string, string>>>
	popoverHighlights: ReturnType<typeof computed<CalendarHighlight[]>>
	closePopover: () => void
	dayClasses: (date: Date, isCustomSlot: boolean) => Record<string, boolean>
}

function useCalendarPopover(options: UseCalendarPopoverOptions): UseCalendarPopoverReturn {
	const {
		getEvents,
		isCurrentMonth,
		isToday,
		isSelected,
		isInRange,
		isWeekend,
		isDayDisabled,
		isRangeStart,
		isRangeEnd,
		isOutOfRange,
	} = options

	const popoverDate = ref<Date | null>(null)
	const popoverStyle = ref<Record<string, string>>({})

	const popoverHighlights = computed(() => {
		if (!popoverDate.value) return []
		return getEvents(popoverDate.value)
	})

	function closePopover(): void {
		popoverDate.value = null
	}

	function dayClasses(date: Date, isCustomSlot: boolean): Record<string, boolean> {
		const isCurrent = isCurrentMonth(date)
		return {
			'base-calendar__day--other': !isCurrent,
			'base-calendar__day--today': isToday(date),
			'base-calendar__day--selected': isCurrent && isSelected(date),
			'base-calendar__day--range': isCurrent && isInRange(date),
			'base-calendar__day--weekend': isWeekend(date),
			'base-calendar__day--disabled': isDayDisabled(date),
			'base-calendar__day--start': isCurrent && isRangeStart(date),
			'base-calendar__day--end': isCurrent && isRangeEnd(date),
			'base-calendar__day--out-of-range': isCurrent && isOutOfRange(date),
			'base-calendar__day--custom': isCustomSlot,
		}
	}

	return {
		popoverDate,
		popoverStyle,
		popoverHighlights,
		closePopover,
		dayClasses,
	}
}

export { useCalendarPopover }
