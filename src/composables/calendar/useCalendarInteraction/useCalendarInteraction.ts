/** Composable: обработка кликов по дням календаря, переключение AM/PM и кнопки «Сегодня» */
import { computed, watch } from 'vue'
import { useCalendarSelectionClick } from './useCalendarSelectionClick'
import type {
	CalendarDatePopoverSources,
	CalendarViewEventSources,
	UseCalendarInteractionOptions,
} from './types/useCalendarInteraction.types'

function watchViewChanges({ calendar, emit }: CalendarViewEventSources): void {
	watch(calendar.currentMonth, newMonth => {
		emit('month-change', newMonth)
	})

	watch(calendar.currentYear, newYear => {
		emit('year-change', newYear)
	})

	watch(calendar.currentView, newView => {
		emit('view-change', newView)
	})
}

function toggleDatePopover(options: CalendarDatePopoverSources, date: Date): void {
	const { popoverDate, popoverStyle } = options.popover
	popoverDate.value = popoverDate.value && options.calendar.isSameDay(popoverDate.value, date) ? null : date
	popoverStyle.value = {
		top: '100%',
		left: '50%',
		transform: 'translateX(-50%)',
	}
}

function useCalendarInteraction(options: UseCalendarInteractionOptions) {
	const { calendar, getIsDisabled, getShowDatePopover, isAm, emit } = options
	const { hours, isDayDisabled, getEvents, setSingleValue, buildDateWithTime, goToToday } = calendar
	const { handleSelectionClick } = useCalendarSelectionClick(options)

	watchViewChanges(options)

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
		if (getShowDatePopover() || getEvents(date).length > 0) toggleDatePopover(options, date)
		handleSelectionClick(date)
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
