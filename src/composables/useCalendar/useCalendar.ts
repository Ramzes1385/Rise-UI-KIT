import { buildDateWithTime as buildDateWithTimeUtil, getWeekNumber, isSameDay } from '@utils/dateUtils'
import { ref, watch } from 'vue'

import type { CalendarView, UseCalendarOptions } from './useCalendar.types'
import { useCalendarDateState } from './useCalendarDateState'
import { useCalendarGrid } from './useCalendarGrid'
import { useCalendarNavigation } from './useCalendarNavigation'

export function useCalendar(options: UseCalendarOptions) {
	const currentMonth = ref(options.initialMonth?.() ?? new Date().getMonth())
	const currentYear = ref(options.initialYear?.() ?? new Date().getFullYear())
	const currentView = ref<CalendarView>('days')

	const hours = ref(0)
	const minutes = ref(0)
	const seconds = ref(0)

	const internalValue = ref<Date | null>(null)
	const internalValueEnd = ref<Date | null>(null)
	const internalSelectedDates = ref<Date[]>([])

	watch(
		() => options.initialMonth?.(),
		val => {
			if (val !== undefined) currentMonth.value = val
		},
	)

	watch(
		() => options.initialYear?.(),
		val => {
			if (val !== undefined) currentYear.value = val
		},
	)

	watch(
		() => options.modelValue(),
		val => {
			const date = val ? new Date(val) : null
			internalValue.value = date
			if (date && options.initialMonth?.() === undefined) {
				currentMonth.value = date.getMonth()
				currentYear.value = date.getFullYear()
				hours.value = date.getHours()
				minutes.value = date.getMinutes()
				seconds.value = date.getSeconds()
			}
		},
		{ immediate: true },
	)

	watch(
		() => options.modelValueEnd(),
		val => {
			internalValueEnd.value = val ? new Date(val) : null
		},
		{ immediate: true },
	)

	watch(
		() => options.selectedDates(),
		val => {
			internalSelectedDates.value = Array.isArray(val) ? val.map(item => new Date(item)) : []
		},
		{ immediate: true },
	)

	const grid = useCalendarGrid({
		currentMonth,
		currentYear,
		currentView,
		locale: options.locale,
		firstDayOfWeek: options.firstDayOfWeek,
		showYear: options.showYear,
	})

	const dateState = useCalendarDateState({
		internalValue,
		internalValueEnd,
		internalSelectedDates,
		currentMonth,
		currentYear,
		selectionMode: options.selectionMode,
		disabledDates: options.disabledDates,
		disabledWeekdays: options.disabledWeekdays,
		minDate: options.minDate,
		maxDate: options.maxDate,
		disableFrom: options.disableFrom,
		disableTo: options.disableTo,
		highlights: options.highlights,
		weekends: options.weekends,
	})

	const navigation = useCalendarNavigation({
		currentMonth,
		currentYear,
		currentView,
		minDate: options.minDate,
		maxDate: options.maxDate,
		disableFrom: options.disableFrom,
		disableTo: options.disableTo,
	})

	function setSingleValue(date: Date | null): void {
		internalValue.value = date
	}

	function setRangeStart(date: Date | null): void {
		internalValue.value = date
	}

	function setRangeEnd(date: Date | null): void {
		internalValueEnd.value = date
	}

	function toggleMultipleDate(date: Date): void {
		const idx = internalSelectedDates.value.findIndex(item => isSameDay(item, date))
		if (idx > -1) {
			internalSelectedDates.value.splice(idx, 1)
		} else {
			internalSelectedDates.value.push(date)
		}
	}

	function buildDateWithTime(date: Date): Date {
		return buildDateWithTimeUtil({
			date,
			hours: hours.value,
			minutes: minutes.value,
			seconds: seconds.value,
		})
	}

	return {
		currentMonth,
		currentYear,
		currentView,
		hours,
		minutes,
		seconds,
		internalValue,
		internalValueEnd,
		internalSelectedDates,
		...grid,
		...dateState,
		...navigation,
		setSingleValue,
		setRangeStart,
		setRangeEnd,
		toggleMultipleDate,
		buildDateWithTime,
		getWeekNumber,
		isSameDay,
	}
}
