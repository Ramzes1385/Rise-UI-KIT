import type { CalendarVariant } from '@components/BaseCalendar'
import type { BaseDatePickerCalendarConfig } from '../../model/BaseDatePickerCalendar.types'

export interface DatePickerRangePanelMonthItem {
	key: string
	month: number
	year: number
}

export interface DatePickerRangePanelProps {
	modelValue?: Date | null
	modelValueEnd?: Date | null
	selectedDates?: Date[]
	calendarVariant: CalendarVariant
	calendarConfig: BaseDatePickerCalendarConfig
	sizeScale: number
	monthItems: DatePickerRangePanelMonthItem[]
}

export interface DatePickerRangePanelEmits {
	(event: 'model-update', value: Date | null): void
	(event: 'model-end-update', value: Date | null): void
	(event: 'selected-update', value: Date[]): void
	(event: 'range-select', start: Date, end: Date): void
	(event: 'month-change', month: number, itemIndex: number): void
	(event: 'year-change', year: number, itemIndex: number): void
}
