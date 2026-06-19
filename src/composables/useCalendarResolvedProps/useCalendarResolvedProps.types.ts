import type { BaseCalendarProps } from '@components/BaseCalendar/model/BaseCalendar.types'

export interface ResolvedCalendarProps {
	modelValue: Date | null
	modelValueEnd: Date | null
	selectedDates: Date[]
	selectionMode: NonNullable<BaseCalendarProps['selectionMode']>
	minDate: Date | null
	maxDate: Date | null
	disabledDates: Date[]
	disabledWeekdays: NonNullable<BaseCalendarProps['disabledWeekdays']>
	disableFrom: Date | null
	disableTo: Date | null
	highlights: NonNullable<BaseCalendarProps['highlights']>
	events: NonNullable<BaseCalendarProps['events']>
	weekends: BaseCalendarProps['weekends']
	firstDayOfWeek: NonNullable<BaseCalendarProps['firstDayOfWeek']>
	showTime: boolean
	showSeconds: boolean
	is24Hour: boolean
	showWeekNumber: boolean
	locale: string
	variant: NonNullable<BaseCalendarProps['variant']>
	color: BaseCalendarProps['color']
	showDatePopover: boolean
	sizeScale: number
	isDisabled: boolean
	showNavigation: boolean
	canSwitchView: boolean
	showTodayButton: boolean
	showYear: boolean
	initialMonth: BaseCalendarProps['initialMonth']
	initialYear: BaseCalendarProps['initialYear']
	customClass: BaseCalendarProps['customClass']
}
