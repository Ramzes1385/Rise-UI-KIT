import type { ComputedRef } from 'vue'
import { computed, nextTick, ref, watch } from 'vue'
import type { EventCalendarWorkHours } from '../types/BaseEventCalendar.types'
import { eventTime, formatHeaderDay, formatTime } from './eventCalendarFormat'
import type { CalendarTimeSegment, CalendarWeekSegment } from '@utils/calendar/eventUtils'
import { columnKey, columnName, itemsOfResource } from './resources/eventCalendarResources'
import { addDays, daysBetween, layoutDay, layoutWeek, toDayKey } from '@utils/calendar/eventUtils'
import type {
	EventCalendarContext,
	EventCalendarResourceHeader,
	EventCalendarTimeDay,
	EventCalendarTimeSlot,
} from '../types/BaseEventCalendarModel.types'

const MINUTES_PER_DAY = 1440
export const DEFAULT_SCROLL_MINUTE = 8 * 60
const WORK_DAYS = [1, 2, 3, 4, 5]

export function parseMinutes(value: string): number | null {
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
	const { props, period, items, today, resources } = context
	const { step } = context
	const days = computed(() => Array.from({ length: dayCount.value }, (_, index) => addDays(period.value.start, index)))
	return {
		timeDays: computed(() =>
			(resources.value.length ? resources.value : [null]).flatMap(resource => {
				const own = itemsOfResource(items.value, resource)
				return days.value.map((date, index): EventCalendarTimeDay => {
					const label = formatHeaderDay(date)
					return {
						date,
						key: columnKey(date, resource?.id),
						dayKey: toDayKey(date),
						resource,
						isResourceStart: Boolean(resource) && index === 0,
						name: columnName(label, resource),
						label,
						isToday: date.getTime() === today.value.getTime(),
						work: workBand(props.workHours, date),
						segments: layoutDay(own, date),
					}
				})
			}),
		),
		resourceHeaders: computed(() =>
			resources.value.map((resource): EventCalendarResourceHeader => ({ key: String(resource.id), resource, days: days.value })),
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

function useAllDay(context: EventCalendarContext, dayCount: ComputedRef<number>) {
	const { period, items, resources } = context
	const columnCount = computed(() => dayCount.value * Math.max(1, resources.value.length))
	const allDaySegments = computed(() => {
		const allDay = items.value.filter(item => item.allDay)
		return (resources.value.length ? resources.value : [null]).flatMap((resource, index) =>
			layoutWeek(itemsOfResource(allDay, resource), period.value.start, dayCount.value).map(segment => ({
				...segment,
				column: segment.column + index * dayCount.value,
			})),
		)
	})
	return {
		columnCount,
		allDaySegments,
		allDayLanes: computed(() => Math.max(1, ...allDaySegments.value.map(segment => segment.lane + 1))),
		allDayStyle: (segment: CalendarWeekSegment) => ({
			left: percent(segment.column / columnCount.value),
			width: percent(segment.span / columnCount.value),
			'--lane': segment.lane,
		}),
	}
}

export function useEventCalendarTimeGrid(context: EventCalendarContext) {
	const { props, period, now } = context
	const dayCount = computed(() => daysBetween(period.value.start, period.value.end))
	return {
		scrollRef: useTimeScroll(context),
		...useTimeColumns(context, dayCount),
		...useAllDay(context, dayCount),
		timedStyle: (segment: CalendarTimeSegment) => ({
			top: percent(segment.top),
			height: percent(segment.height),
			left: percent(segment.column / segment.columns),
			width: percent(1 / segment.columns),
		}),
		workStyle: (work: NonNullable<EventCalendarTimeDay['work']>) => ({ top: percent(work.top), height: percent(work.height) }),
		isCompact: (segment: CalendarTimeSegment): boolean =>
			segment.height * MINUTES_PER_DAY < Math.min(60, Math.max(5, props.slotDuration)) * 1.5,
		nowStyle: computed(() => ({ top: percent((now.value.getHours() * 60 + now.value.getMinutes()) / MINUTES_PER_DAY) })),
		timedTime: (segment: CalendarTimeSegment): string => eventTime(segment.item),
		hasNowLine: (day: EventCalendarTimeDay): boolean => props.hasNowIndicator && day.isToday,
	}
}
