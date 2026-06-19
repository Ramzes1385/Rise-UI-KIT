import type { CalendarSelectionMode } from '@components/BaseCalendar'
import type { DateFormat } from '@utils/dateUtils'

export interface UseDatePickerStateOptions {
	props: {
		modelValue?: Date | null
		modelValueEnd?: Date | null
		selectedDates?: Date[]
		isDisabled?: boolean
		isMultiMonth?: boolean
		sizeScale?: number
	}
	resolvedProps: {
		value: {
			selectionMode: CalendarSelectionMode
			dateFormat: DateFormat
			isDisabled: boolean
			isMultiMonth: boolean
			sizeScale: number
			closeOnClickOutside: boolean
			closeOnEscape: boolean
			gap: number
			isClearable?: boolean
			isReadonly?: boolean
			isRequired?: boolean
			placeholder?: string
			label?: string
			error?: string
			inputVariant?: string
			calendarVariant?: string
		}
	}
	emit: {
		(event: 'update:modelValue', value: Date | null): void
		(event: 'update:modelValueEnd', value: Date | null): void
		(event: 'update:selectedDates', value: Date[]): void
		(event: 'open'): void
		(event: 'close'): void
		(event: 'clear'): void
		(event: 'range-select', start: Date, end: Date): void
	}
	calendarConfig: {
		value: {
			showTime: boolean
			showSeconds: boolean
			is24Hour: boolean
			locale: string
		}
	}
}
