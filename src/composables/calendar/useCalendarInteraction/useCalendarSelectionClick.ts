/** Composable: выбор даты кликом по дню — одиночный, диапазон или несколько дат */
import type { UseCalendarSelectionClickOptions } from './types/useCalendarInteraction.types'

function useCalendarSelectionClick(options: UseCalendarSelectionClickOptions) {
	const { calendar, getSelectionMode, getShowTime, emit } = options
	const { setSingleValue, setRangeStart, setRangeEnd, toggleMultipleDate, buildDateWithTime } = calendar

	function handleSingleClick(date: Date): void {
		const result = getShowTime() ? buildDateWithTime(date) : date
		setSingleValue(result)
		emit('update:modelValue', result)
	}

	function startRange(date: Date, end: Date | null): void {
		setRangeStart(date)
		setRangeEnd(end)
		emit('update:modelValue', date)
		emit('update:modelValueEnd', end)
	}

	function handleRangeClick(date: Date): void {
		const start = calendar.internalValue.value
		const end = calendar.internalValueEnd.value

		if (!start || (start && end)) {
			startRange(date, null)
			return
		}
		if (date < start) {
			startRange(date, start)
		} else {
			setRangeEnd(date)
			emit('update:modelValueEnd', date)
		}
		emit('range-select', calendar.internalValue.value!, calendar.internalValueEnd.value!)
	}

	function handleMultipleClick(date: Date): void {
		toggleMultipleDate(date)
		emit('update:selectedDates', [...calendar.internalSelectedDates.value])
	}

	function handleSelectionClick(date: Date): void {
		if (getSelectionMode() === 'single') {
			handleSingleClick(date)
			return
		}

		if (getSelectionMode() === 'range') {
			handleRangeClick(date)
			return
		}

		handleMultipleClick(date)
	}

	return { handleSelectionClick }
}

export { useCalendarSelectionClick }
