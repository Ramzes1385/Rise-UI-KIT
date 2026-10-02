import { useSlots } from 'vue'
import { eventLabel, eventTime, formatTime } from './eventCalendarFormat'
import type { NormalizedCalendarEvent } from '@utils/calendar/eventUtils'
import type { DaySlotName, EventCalendarContext, EventCalendarMonthDay, EventSlotName } from '../types/BaseEventCalendarModel.types'
import type { EventCalendarDaySlotProps, EventCalendarEventPayload, EventCalendarEventSlotProps } from '../types/BaseEventCalendar.types'

function payload(item: NormalizedCalendarEvent): EventCalendarEventPayload {
	return { event: item.event, start: item.start, end: item.end, allDay: item.allDay }
}

export function useEventCalendarEvents(context: EventCalendarContext) {
	const slots = useSlots() as Record<string, unknown>
	const has = (name: string): boolean => Boolean(slots[name])

	return {
		eventLabel,
		eventTime,
		eventStart: (item: NormalizedCalendarEvent): string => (item.allDay ? '' : formatTime(item.start)),
		eventStyle: (item: NormalizedCalendarEvent) => (item.event.color ? { '--event-color': item.event.color } : {}),
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
