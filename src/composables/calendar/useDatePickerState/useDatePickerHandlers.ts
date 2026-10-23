/** Composable: обработчики изменений значения дейтпикера — очистка, выбор даты, дат и диапазона */
import type { UseDatePickerHandlersOptions } from './types/useDatePickerState.types'

function useDatePickerHandlers(options: UseDatePickerHandlersOptions) {
	const { values, resolvedProps, calendarConfig, emit, close } = options
	const { innerValue, innerValueEnd, innerDates } = values

	function handleClear(): void {
		innerValue.value = null
		innerValueEnd.value = null
		innerDates.value = []
		emit('update:modelValue', null)
		emit('update:modelValueEnd', null)
		emit('update:selectedDates', [])
		emit('clear')
	}

	function handleModelUpdate(value: Date | null): void {
		innerValue.value = value
		emit('update:modelValue', value)
		if (resolvedProps.value.selectionMode === 'single' && value && !calendarConfig.value.showTime) {
			close()
		}
	}

	function handleModelEndUpdate(value: Date | null): void {
		innerValueEnd.value = value
		emit('update:modelValueEnd', value)
	}

	function handleSelectedDatesUpdate(value: Date[]): void {
		innerDates.value = [...value]
		emit('update:selectedDates', value)
	}

	function handleRangeSelect(start: Date, end: Date): void {
		innerValue.value = start
		innerValueEnd.value = end
		emit('update:modelValue', start)
		emit('update:modelValueEnd', end)
		emit('range-select', start, end)

		if (!calendarConfig.value.showTime) {
			close()
		}
	}

	return { handleClear, handleModelUpdate, handleModelEndUpdate, handleSelectedDatesUpdate, handleRangeSelect }
}

export { useDatePickerHandlers }
