import { useSlots } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_EVENT_CALENDAR } from '@/locales/messages'
import { findResource } from './eventCalendarResources'
import { eventLabel, eventTime, formatTime } from './eventCalendarFormat'
import type { NormalizedCalendarEvent } from '@utils/calendar/eventUtils'
import type {
	EventCalendarDaySlotProps,
	EventCalendarEventPayload,
	EventCalendarEventSlotProps,
	EventCalendarResourceSlotProps,
} from '../types/BaseEventCalendar.types'
import type {
	DaySlotName,
	EventCalendarContext,
	EventCalendarMonthDay,
	EventCalendarResourceHeader,
	EventSlotName,
	ResourceSlotName,
} from '../types/BaseEventCalendarModel.types'

function payload(item: NormalizedCalendarEvent): EventCalendarEventPayload {
	return { event: item.event, start: item.start, end: item.end, allDay: item.allDay }
}

export function useEventCalendarEvents(context: EventCalendarContext) {
	const slots = useSlots() as Record<string, unknown>
	const has = (name: string): boolean => Boolean(slots[name])
	const resourceOf = (item: NormalizedCalendarEvent) => findResource(context, item.event.resourceId)

	return {
		eventLabel(item: NormalizedCalendarEvent): string {
			const resource = resourceOf(item)
			const label = eventLabel(item)
			return resource ? formatMessage(UI_EVENT_CALENDAR.EVENT_RESOURCE, { event: label, resource: resource.title }) : label
		},
		eventTime,
		eventStart: (item: NormalizedCalendarEvent): string => (item.allDay ? '' : formatTime(item.start)),
		eventStyle(item: NormalizedCalendarEvent) {
			const color = item.event.color ?? resourceOf(item)?.color
			return color ? { '--event-color': color } : {}
		},
		resourceSlot(header: EventCalendarResourceHeader): ResourceSlotName | null {
			if (has(`resource-${header.key}`)) return `resource-${header.key}`
			return has('resource') ? 'resource' : null
		},
		resourceSlotProps: (header: EventCalendarResourceHeader): EventCalendarResourceSlotProps => ({
			resource: header.resource,
			days: header.days,
		}),
		eventSlot(item: NormalizedCalendarEvent): EventSlotName | null {
			const { id, category } = item.event
			if (has(`event-${id}`)) return `event-${id}`
			if (category && has(`category-${category}`)) return `category-${category}`
			return has('event') ? 'event' : null
		},
		eventSlotProps: (item: NormalizedCalendarEvent): EventCalendarEventSlotProps => ({
			...payload(item),
			time: eventTime(item),
			view: context.view.value,
		}),
		daySlot(day: EventCalendarMonthDay): DaySlotName | null {
			if (has(`day-${day.key}`)) return `day-${day.key}`
			return has('day') ? 'day' : null
		},
		daySlotProps: (day: EventCalendarMonthDay): EventCalendarDaySlotProps => ({
			date: day.date,
			isToday: day.isToday,
			isOutside: day.isOutside,
			events: day.items,
		}),
		handleEventClick(item: NormalizedCalendarEvent): void {
			context.emit('event-click', payload(item))
		},
	}
}
