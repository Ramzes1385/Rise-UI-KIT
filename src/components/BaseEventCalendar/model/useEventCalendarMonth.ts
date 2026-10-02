import { computed, nextTick, ref } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_EVENT_CALENDAR } from '@/locales/messages'
import { shiftPeriod } from './useEventCalendarToolbar'
import { formatDayLabel, formatFullDate, weekdayNames } from './eventCalendarFormat'
import type { CalendarWeekSegment, NormalizedCalendarEvent } from '@utils/calendar/eventUtils'
import { addDays, daysBetween, layoutWeek, startOfDay, toDayKey } from '@utils/calendar/eventUtils'
import type { EventCalendarContext, EventCalendarMonthDay, EventCalendarMonthWeek } from '../types/BaseEventCalendarModel.types'

function keyStep(event: KeyboardEvent, date: Date, firstDay: number): Date | null {
	const weekday = (date.getDay() - firstDay + 7) % 7
	const steps: Record<string, () => Date> = {
		ArrowLeft: () => addDays(date, -1),
		ArrowRight: () => addDays(date, 1),
		ArrowUp: () => addDays(date, -7),
		ArrowDown: () => addDays(date, 7),
		Home: () => addDays(date, -weekday),
		End: () => addDays(date, 6 - weekday),
		PageUp: () => shiftPeriod('month', date, event.shiftKey ? -12 : -1),
		PageDown: () => shiftPeriod('month', date, event.shiftKey ? 12 : 1),
	}
	return Object.hasOwn(steps, event.key) ? steps[event.key]() : null
}

function coversDay(segment: CalendarWeekSegment, column: number): boolean {
	return segment.column <= column && column < segment.column + segment.span
}

function buildWeek(context: EventCalendarContext, start: Date): EventCalendarMonthWeek {
	const { props, items, date, today } = context
	const segments = layoutWeek(items.value, start)
	const lanesUsed = Math.max(0, ...segments.map(segment => segment.lane + 1))
	const hasMore = lanesUsed > props.maxEventsPerDay
	const lanes = hasMore ? Math.max(0, props.maxEventsPerDay - 1) : lanesUsed
	const days = Array.from({ length: 7 }, (_, column): EventCalendarMonthDay => {
		const day = addDays(start, column)
		const dayItems = segments.filter(segment => coversDay(segment, column))
		return {
			date: day,
			key: toDayKey(day),
			column,
			isToday: day.getTime() === today.value.getTime(),
			isOutside: day.getMonth() !== date.value.getMonth(),
			label: formatFullDate(day),
			hidden: dayItems.filter(segment => segment.lane >= lanes).length,
			items: dayItems.map(segment => segment.item),
		}
	})
	return { key: toDayKey(start), days, segments: segments.filter(segment => segment.lane < lanes), lanes, hasMore }
}

export function useEventCalendarMonth(context: EventCalendarContext) {
	const { period, date, firstDay, setDate } = context
	const gridRef = ref<HTMLElement | null>(null)
	const openDay = ref<string | null>(null)
	const weeks = computed(() =>
		Array.from({ length: daysBetween(period.value.start, period.value.end) / 7 }, (_, index) =>
			buildWeek(context, addDays(period.value.start, index * 7)),
		),
	)
	const focusedKey = computed(() => toDayKey(date.value))

	function focusDay(): void {
		nextTick(() => gridRef.value?.querySelector<HTMLElement>(`[data-day="${focusedKey.value}"]`)?.focus())
	}

	return {
		gridRef,
		weeks,
		weekdays: computed(() => weekdayNames(firstDay.value)),
		focusedKey,
		openDay,
		segmentsOf: (week: EventCalendarMonthWeek, column: number): CalendarWeekSegment[] =>
			week.segments.filter(segment => segment.column === column),
		isSegmentFocusable: (segment: CalendarWeekSegment, week: EventCalendarMonthWeek): boolean => {
			const column = daysBetween(week.days[0].date, date.value)
			return column >= 0 && column < 7 && coversDay(segment, column)
		},
		moreText: (day: EventCalendarMonthDay): string => formatMessage(UI_EVENT_CALENDAR.MORE, { count: day.hidden }),
		moreLabel: (day: EventCalendarMonthDay): string => formatMessage(UI_EVENT_CALENDAR.MORE_LABEL, { date: formatDayLabel(day.date) }),
		setMoreOpen: (day: EventCalendarMonthDay, isOpen: boolean): void => {
			openDay.value = isOpen ? day.key : null
		},
		dayEvents: (day: EventCalendarMonthDay): NormalizedCalendarEvent[] => day.items,
		handleDayFocus: (day: EventCalendarMonthDay): void => {
			if (day.key !== focusedKey.value) setDate(startOfDay(day.date))
		},
		handleGridKeydown(event: KeyboardEvent): void {
			if ((event.target as HTMLElement).getAttribute('role') !== 'gridcell') return
			const next = keyStep(event, date.value, firstDay.value)
			if (!next) return
			event.preventDefault()
			setDate(next)
			focusDay()
		},
	}
}
