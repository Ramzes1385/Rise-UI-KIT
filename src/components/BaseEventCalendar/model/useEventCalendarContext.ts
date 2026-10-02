import { getLocale } from '@/locales/state'
import type { CalendarEventDate } from '@utils/calendar/eventUtils'
import { computed, onMounted, onUnmounted, shallowRef, watch } from 'vue'
import { buildMonthDays } from '@composables/calendar/useCalendar/calendarUtils'
import type { EventCalendarContext, EventCalendarProps } from '../types/BaseEventCalendarModel.types'
import { addDays, getEventsInRange, parseEventDate, startOfDay, startOfWeek } from '@utils/calendar/eventUtils'
import type { BaseEventCalendarEmits, EventCalendarPeriod, EventCalendarView } from '../types/BaseEventCalendar.types'

const MINUTE = 60_000

function toDate(value: CalendarEventDate | undefined): Date | null {
	return value === undefined ? null : (parseEventDate(value)?.date ?? null)
}

function periodOf(view: EventCalendarView, date: Date, firstDay: number): EventCalendarPeriod {
	if (view === 'month') {
		const days = buildMonthDays({ year: date.getFullYear(), month: date.getMonth() }, firstDay)
		return { view, start: days[0], end: addDays(days[days.length - 1], 1) }
	}
	if (view === 'week') {
		const start = startOfWeek(date, firstDay)
		return { view, start, end: addDays(start, 7) }
	}
	if (view === 'day') return { view, start: startOfDay(date), end: addDays(startOfDay(date), 1) }
	const start = new Date(date.getFullYear(), date.getMonth(), 1)
	return { view, start, end: new Date(date.getFullYear(), date.getMonth() + 1, 1) }
}

function useNow() {
	const now = shallowRef(new Date())
	let timer: ReturnType<typeof setInterval> | undefined
	onMounted(() => {
		timer = setInterval(() => {
			now.value = new Date()
		}, MINUTE)
	})
	onUnmounted(() => clearInterval(timer))
	return now
}

function propCopy<T>(source: () => T) {
	const copy = shallowRef(source())
	watch(source, value => {
		copy.value = value
	})
	return copy
}

export function useEventCalendarContext(props: EventCalendarProps, emit: BaseEventCalendarEmits): EventCalendarContext {
	const now = useNow()
	const view = propCopy(() => props.view)
	const date = propCopy(() => startOfDay(toDate(props.date) ?? new Date()))
	const today = computed(() => startOfDay(toDate(props.today) ?? now.value))
	const firstDay = computed(() => props.firstDayOfWeek ?? getLocale().firstDayOfWeek)
	const period = computed(() => periodOf(view.value, date.value, firstDay.value))
	const items = computed(() => getEventsInRange(props.events, period.value))
	watch(
		() => [period.value.view, period.value.start.getTime(), period.value.end.getTime()],
		() => emit('period-change', period.value),
		{ immediate: true },
	)
	return {
		props,
		emit,
		view,
		date,
		now: computed(() => toDate(props.today) ?? now.value),
		today,
		firstDay,
		period,
		items,
		setDate(value: Date): void {
			date.value = startOfDay(value)
			emit('update:date', date.value)
		},
		setView(value: EventCalendarView): void {
			if (value === view.value) return
			view.value = value
			emit('update:view', value)
		},
	}
}
