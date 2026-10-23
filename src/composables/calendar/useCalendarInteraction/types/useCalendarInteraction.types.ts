import type { useCalendar } from '../../useCalendar'
import type { useCalendarPopover } from '../../useCalendarPopover'
import type { CalendarSelectionMode, CalendarView } from '@components/BaseCalendar'

type Calendar = ReturnType<typeof useCalendar>
type Popover = ReturnType<typeof useCalendarPopover>

export interface UseCalendarInteractionOptions {
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

/** Источники для обработки выбора даты кликом: календарь, режим выбора, время и события */
export type UseCalendarSelectionClickOptions = Pick<UseCalendarInteractionOptions, 'calendar' | 'getSelectionMode' | 'getShowTime' | 'emit'>

/** Источники событий смены вида: календарь и emit */
export type CalendarViewEventSources = Pick<UseCalendarInteractionOptions, 'calendar' | 'emit'>

/** Источники всплывающего окна даты: календарь и popover */
export type CalendarDatePopoverSources = Pick<UseCalendarInteractionOptions, 'calendar' | 'popover'>
