/** Composable: обработка кликов по дням календаря, переключение AM/PM и кнопки «Сегодня» */
import { computed, watch } from 'vue'
import type { UseCalendarInteractionOptions } from './types/useCalendarInteraction.types'

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

	/** AM/PM выводится из часов — единственного источника истины о времени */
	const isAmResolved = computed((): boolean => hours.value < 12)

	// v-model:is-am следует за часами. Раньше isAm хранился отдельно (по умолчанию true):
	// 14:30 отображалось как «2:30 AM», а введённый час попадал не в ту половину суток
	watch(
		isAmResolved,
		value => {
			isAm.value = value
		},
		{ immediate: true },
	)

	// Внешнее изменение v-model:is-am работает как нажатие переключателя AM/PM
	watch(
		() => isAm.value,
		value => {
			if (value !== isAmResolved.value) toggleAmPm()
		},
	)

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
		hours.value = hours.value >= 12 ? hours.value - 12 : hours.value + 12
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
		isAmResolved,
		handleDayClick,
		toggleAmPm,
		handleTimeChange,
		handleTodayClick,
	}
}

export { useCalendarInteraction }
