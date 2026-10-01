/** Composable: состояние календаря — видимый месяц, время и выбранные значения, синхронизированные с опциями */
import { ref, watch } from 'vue'
import type { CalendarState } from './types/useCalendarState.types'
import type { CalendarView, UseCalendarOptions } from './types/useCalendar.types'

function watchVisibleMonth(options: UseCalendarOptions, state: CalendarState): void {
	watch(
		() => options.initialMonth?.(),
		month => {
			if (month !== undefined) state.currentMonth.value = month
		},
	)

	watch(
		() => options.initialYear?.(),
		year => {
			if (year !== undefined) state.currentYear.value = year
		},
	)
}

function watchModelValue(options: UseCalendarOptions, state: CalendarState): void {
	watch(
		() => options.modelValue(),
		newValue => {
			const date = newValue ? new Date(newValue) : null
			state.internalValue.value = date
			if (!date) return
			// Время всегда берётся из значения: initialMonth управляет только отображаемым месяцем.
			// Иначе при заданном initialMonth (панель date picker передаёт его всегда) поля времени
			// оставались 00:00 и следующий клик по дню затирал время значения.
			state.hours.value = date.getHours()
			state.minutes.value = date.getMinutes()
			state.seconds.value = date.getSeconds()
			if (options.initialMonth?.() !== undefined) return
			state.currentMonth.value = date.getMonth()
			state.currentYear.value = date.getFullYear()
		},
		{ immediate: true },
	)
}

function watchRangeAndDates(options: UseCalendarOptions, state: CalendarState): void {
	watch(
		() => options.modelValueEnd(),
		endDate => {
			state.internalValueEnd.value = endDate ? new Date(endDate) : null
		},
		{ immediate: true },
	)

	watch(
		() => options.selectedDates(),
		dates => {
			state.internalSelectedDates.value = Array.isArray(dates) ? dates.map(item => new Date(item)) : []
		},
		{ immediate: true },
	)
}

function useCalendarState(options: UseCalendarOptions): CalendarState {
	const state: CalendarState = {
		currentMonth: ref(options.initialMonth?.() ?? new Date().getMonth()),
		currentYear: ref(options.initialYear?.() ?? new Date().getFullYear()),
		currentView: ref<CalendarView>('days'),
		hours: ref(0),
		minutes: ref(0),
		seconds: ref(0),
		internalValue: ref<Date | null>(null),
		internalValueEnd: ref<Date | null>(null),
		internalSelectedDates: ref<Date[]>([]),
	}

	watchVisibleMonth(options, state)
	watchModelValue(options, state)
	watchRangeAndDates(options, state)

	return state
}

export { useCalendarState }
