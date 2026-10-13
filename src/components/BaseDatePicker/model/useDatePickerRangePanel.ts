import { computed } from 'vue'
import { partClassOf } from './datePickerUi'
import { toBaseCalendarProps, withoutTimeBlock } from './datePickerCalendarConfig'
import { pendingRangeConstraints, resolveRangeLimits } from './range/dateRangeLimits'
import type { DatePickerRangePanelEmits, DatePickerRangePanelProps } from '../types/DatePickerRangePanel.types'

export function useDatePickerRangePanel(props: DatePickerRangePanelProps, emit: DatePickerRangePanelEmits) {
	const calendarBindings = computed(() => {
		const bindings = toBaseCalendarProps(props.calendarConfig, {
			showYear: props.monthItems.length === 1,
			showTodayButton: props.monthItems.length === 1,
		})
		const limits = resolveRangeLimits(props.minDays, props.maxDays)
		if (!props.modelValue || props.modelValueEnd || (limits.minDays === null && limits.maxDays === null)) return bindings
		return { ...bindings, constraints: pendingRangeConstraints(props.modelValue, bindings.constraints, limits) }
	})

	return {
		ui: partClassOf(props),
		calendarBindings,
		secondaryCalendarBindings: computed(() => withoutTimeBlock(calendarBindings.value)),
		handleModelUpdate: (value: Date | null): void => emit('model-update', value),
		handleModelEndUpdate: (value: Date | null): void => emit('model-end-update', value),
		handleSelectedUpdate: (value: Date[]): void => emit('selected-update', value),
		handleRangeSelect: (start: Date, end: Date): void => emit('range-select', start, end),
	}
}
