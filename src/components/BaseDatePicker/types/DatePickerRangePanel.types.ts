import type { UiClassFn } from '@composables/base/useUi'
import type { CalendarVariant } from '@components/BaseCalendar'
import type { BaseDatePickerPart } from './BaseDatePicker.types'
import type { BaseDatePickerCalendarConfig } from './BaseDatePickerCalendar.types'

interface DatePickerRangePanelMonthItem {
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
	/** Наименьшая длина диапазона в днях: пока выбрано только начало, слишком близкие дни отключены */
	minDays?: number | null
	/** Наибольшая длина диапазона в днях: пока выбрано только начало, слишком далёкие дни отключены */
	maxDays?: number | null
	/** Классы частей дейтпикера: `ui` родителя (`.base-date-picker__<часть>` и классы из пропа `ui`) */
	partClass?: UiClassFn<BaseDatePickerPart>
}

export interface DatePickerRangePanelEmits {
	(event: 'model-update', value: Date | null): void
	(event: 'model-end-update', value: Date | null): void
	(event: 'selected-update', value: Date[]): void
	(event: 'range-select', start: Date, end: Date): void
	(event: 'month-change', month: number, itemIndex: number): void
	(event: 'year-change', year: number, itemIndex: number): void
}
