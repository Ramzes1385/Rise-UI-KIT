import type { ComputedRef } from 'vue'
import { computed, nextTick, ref, watch } from 'vue'
import type { EventCalendarWorkHours } from '../types/BaseEventCalendar.types'
import { eventTime, formatHeaderDay, formatTime } from './eventCalendarFormat'
import type { CalendarTimeSegment, CalendarWeekSegment } from '@utils/calendar/eventUtils'
import { addDays, daysBetween, layoutDay, layoutWeek, toDayKey } from '@utils/calendar/eventUtils'
import type { EventCalendarContext, EventCalendarTimeDay, EventCalendarTimeSlot } from '../types/BaseEventCalendarModel.types'

const MINUTES_PER_DAY = 1440
const DEFAULT_SCROLL_MINUTE = 8 * 60
const WORK_DAYS = [1, 2, 3, 4, 5]

function parseMinutes(value: string): number | null {
	const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
	return match ? Math.min(MINUTES_PER_DAY, Number(match[1]) * 60 + Number(match[2])) : null
}

function workBand(hours: EventCalendarWorkHours | undefined, day: Date): EventCalendarTimeDay['work'] {
	if (!hours || !(hours.days ?? WORK_DAYS).includes(day.getDay())) return null
	const start = parseMinutes(hours.start)
	const end = parseMinutes(hours.end)
	if (start === null || end === null || end <= start) return null
	return { top: start / MINUTES_PER_DAY, height: (end - start) / MINUTES_PER_DAY }
}

function percent(value: number): string {
	return `${(value * 100).toFixed(4)}%`
}

function useTimeScroll(context: EventCalendarContext) {
	const scrollRef = ref<HTMLElement | null>(null)
	function scrollToStart(): void {
		const minute = (context.props.workHours && parseMinutes(context.props.workHours.start)) ?? DEFAULT_SCROLL_MINUTE
		nextTick(() => {
			const element = scrollRef.value
			if (element) element.scrollTop = (element.scrollHeight * minute) / MINUTES_PER_DAY
		})
	}
	watch(scrollRef, element => element && scrollToStart())
	watch(context.view, scrollToStart)
	return scrollRef
}

function useTimeColumns(context: EventCalendarContext, dayCount: ComputedRef<number>) {
	const { props, period, items, today } = context
	const step = computed(() => Math.min(60, Math.max(5, props.slotDuration)))
	return {
		timeDays: computed(() =>
			Array.from({ length: dayCount.value }, (_, index): EventCalendarTimeDay => {
				const date = addDays(period.value.start, index)
				return {
					date,
					key: toDayKey(date),
					label: formatHeaderDay(date),
					isToday: date.getTime() === today.value.getTime(),
					work: workBand(props.workHours, date),
					segments: layoutDay(items.value, date),
				}
			}),
		),
		timeSlots: computed(() =>
			Array.from({ length: MINUTES_PER_DAY / step.value }, (_, index): EventCalendarTimeSlot => {
				const minutes = index * step.value
				const time = new Date(2000, 0, 1, 0, minutes)
				return { key: String(minutes), time, label: formatTime(time), isHour: minutes % 60 === 0 }
			}),
		),
	}
}

export function useEventCalendarTimeGrid(context: EventCalendarContext) {
	const { props, period, items, now } = context
	const dayCount = computed(() => daysBetween(period.value.start, period.value.end))
	const allDaySegments = computed(() =>
		layoutWeek(
			items.value.filter(item => item.allDay),
			period.value.start,
			dayCount.value,
		),
	)
	return {
		scrollRef: useTimeScroll(context),
		...useTimeColumns(context, dayCount),
		allDaySegments,
		allDayLanes: computed(() => Math.max(1, ...allDaySegments.value.map(segment => segment.lane + 1))),
		allDayStyle: (segment: CalendarWeekSegment) => ({
			left: percent(segment.column / dayCount.value),
			width: percent(segment.span / dayCount.value),
			'--lane': segment.lane,
		}),
		timedStyle: (segment: CalendarTimeSegment) => ({
			top: percent(segment.top),
			height: percent(segment.height),
			left: percent(segment.column / segment.columns),
			width: percent(1 / segment.columns),
		}),
		workStyle: (day: EventCalendarTimeDay) => (day.work ? { top: percent(day.work.top), height: percent(day.work.height) } : {}),
		nowStyle: computed(() => ({ top: percent((now.value.getHours() * 60 + now.value.getMinutes()) / MINUTES_PER_DAY) })),
		timedTime: (segment: CalendarTimeSegment): string => eventTime(segment.item),
		hasNowLine: (day: EventCalendarTimeDay): boolean => props.hasNowIndicator && day.isToday,
	}
}
