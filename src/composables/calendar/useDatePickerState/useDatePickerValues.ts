/** Composable: значения дейтпикера — внутренние и из v-model, признак значения и текст поля */
import { computed, ref, watch } from 'vue'
import { formatDatePickerValue } from '@utils/data/dateUtils'
import type { DatePickerInnerValues, UseDatePickerStateOptions } from './types/useDatePickerState.types'

function watchModelProps(props: UseDatePickerStateOptions['props'], values: DatePickerInnerValues): void {
	watch(
		() => props.modelValue,
		value => {
			if (value === undefined) return
			values.innerValue.value = value
		},
	)

	watch(
		() => props.modelValueEnd,
		value => {
			if (value === undefined) return
			values.innerValueEnd.value = value
		},
	)

	watch(
		() => props.selectedDates,
		value => {
			if (!value) return
			values.innerDates.value = [...value]
		},
	)
}

function useDatePickerValues(options: UseDatePickerStateOptions) {
	const { props, resolvedProps, calendarConfig } = options

	const values: DatePickerInnerValues = {
		innerValue: ref<Date | null>(props.modelValue ?? null),
		innerValueEnd: ref<Date | null>(props.modelValueEnd ?? null),
		innerDates: ref<Date[]>(props.selectedDates ? [...props.selectedDates] : []),
	}

	watchModelProps(props, values)

	const activeValue = computed((): Date | null => (props.modelValue === undefined ? values.innerValue.value : props.modelValue))

	const activeValueEnd = computed((): Date | null =>
		props.modelValueEnd === undefined ? values.innerValueEnd.value : props.modelValueEnd,
	)

	const activeDates = computed((): Date[] => (props.selectedDates === undefined ? values.innerDates.value : props.selectedDates))

	const hasValue = computed((): boolean => {
		if (resolvedProps.value.selectionMode === 'range') {
			return !!(activeValue.value || activeValueEnd.value)
		}
		if (resolvedProps.value.selectionMode === 'multiple') {
			return activeDates.value.length > 0
		}
		return !!activeValue.value
	})

	const displayValue = computed((): string =>
		formatDatePickerValue({
			selectionMode: resolvedProps.value.selectionMode,
			date: activeValue.value,
			endDate: activeValueEnd.value,
			dates: activeDates.value,
			dateFormat: resolvedProps.value.dateFormat,
			showTime: calendarConfig.value.showTime,
			showSeconds: calendarConfig.value.showSeconds,
			is24Hour: calendarConfig.value.is24Hour,
			locale: calendarConfig.value.locale,
		}),
	)

	return { values, activeValue, activeValueEnd, activeDates, hasValue, displayValue }
}

export { useDatePickerValues }
