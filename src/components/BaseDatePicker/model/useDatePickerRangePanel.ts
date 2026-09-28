import { computed } from 'vue'
import { toBaseCalendarProps, withoutTimeBlock } from './datePickerCalendarConfig'
import type { DatePickerRangePanelEmits, DatePickerRangePanelProps } from '../types/DatePickerRangePanel.types'

export function useDatePickerRangePanel(props: DatePickerRangePanelProps, emit: DatePickerRangePanelEmits) {
	const calendarBindings = computed(() =>
		toBaseCalendarProps(props.calendarConfig, {
			showYear: props.monthItems.length === 1,
			showTodayButton: props.monthItems.length === 1,
		}),
	)

	return {
		calendarBindings,
		secondaryCalendarBindings: computed(() => withoutTimeBlock(calendarBindings.value)),
		handleModelUpdate: (value: Date | null): void => emit('model-update', value),
		handleModelEndUpdate: (value: Date | null): void => emit('model-end-update', value),
		handleSelectedUpdate: (value: Date[]): void => emit('selected-update', value),
		handleRangeSelect: (start: Date, end: Date): void => emit('range-select', start, end),
	}
}
