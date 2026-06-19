/** Composable: обработка кликов по дням календаря, переключение AM/PM и кнопки «Сегодня» */
import { watch } from 'vue'
import type { UseCalendarInteractionOptions } from './useCalendarInteraction.types'

/** Описание: обрабатывает клики по дням календаря, переключение AM/PM и кнопки «Сегодня», возвращает обработчики */
function useCalendarInteraction(options: UseCalendarInteractionOptions) {
	const { calendar, popover, getSelectionMode, getShowTime, getIsDisabled, getShowDatePopover, isAm, emit } = options

	const {
		hours,
		isDayDisabled,
		isSameDay,
		getEvents,
		setSingleValue,
		setRangeStart,
		setRangeEnd,
		toggleMultipleDate,
		buildDateWithTime,
		goToToday,
	} = calendar

	watch(calendar.currentMonth, newMonth => {
		emit('month-change', newMonth)
	})

	watch(calendar.currentYear, newYear => {
		emit('year-change', newYear)
	})

	watch(calendar.currentView, newView => {
		emit('view-change', newView)
	})

	function handleDayClick(date: Date): void {
		if (isDayDisabled(date) || getIsDisabled()) return

		emit('date-click', date)

		if (getShowDatePopover() || getEvents(date).length > 0) {
			popover.popoverDate.value = popover.popoverDate.value && isSameDay(popover.popoverDate.value, date) ? null : date
			popover.popoverStyle.value = {
				top: '100%',
				left: '50%',
				transform: 'translateX(-50%)',
			}
		}

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

	function handleSingleClick(date: Date): void {
		const result = getShowTime() ? buildDateWithTime(date) : date
		setSingleValue(result)
		emit('update:modelValue', result)
	}

	function handleRangeClick(date: Date): void {
		const start = calendar.internalValue.value
		const end = calendar.internalValueEnd.value

		if (!start || (start && end)) {
			setRangeStart(date)
			setRangeEnd(null)
			emit('update:modelValue', date)
			emit('update:modelValueEnd', null)
		} else {
			if (date < start) {
				setRangeStart(date)
				setRangeEnd(start)
				emit('update:modelValue', date)
				emit('update:modelValueEnd', start)
			} else {
				setRangeEnd(date)
				emit('update:modelValueEnd', date)
			}
			emit('range-select', calendar.internalValue.value!, calendar.internalValueEnd.value!)
		}
	}

	function handleMultipleClick(date: Date): void {
		toggleMultipleDate(date)
		emit('update:selectedDates', [...calendar.internalSelectedDates.value])
	}

	function toggleAmPm(): void {
		const currentHour = hours.value
		if (isAm.value) {
			hours.value = currentHour < 12 ? currentHour + 12 : currentHour
		} else {
			hours.value = currentHour >= 12 ? currentHour - 12 : currentHour
		}
		isAm.value = !isAm.value
		handleTimeChange()
	}

	function handleTimeChange(): void {
		if (!calendar.internalValue.value) return
		const result = buildDateWithTime(calendar.internalValue.value)
		setSingleValue(result)
		emit('update:modelValue', result)
	}

	function handleTodayClick(): void {
		goToToday()
		const now = new Date()
		setSingleValue(now)
		emit('update:modelValue', now)
		emit('date-click', now)
	}

	return {
		handleDayClick,
		toggleAmPm,
		handleTimeChange,
		handleTodayClick,
	}
}

export { useCalendarInteraction }
export type { UseCalendarInteractionOptions }
