import type { CalendarTimeSegment, CalendarWeekSegment } from '@utils/calendar/eventUtils'
import type { EventCalendarClassSources, EventCalendarMonthDay, EventCalendarTimeDay } from '../../types/BaseEventCalendarModel.types'

export function useEventCalendarClasses(sources: EventCalendarClassSources) {
	const { ui, classes, editClass } = sources
	return {
		dayClass: (day: EventCalendarMonthDay) => [
			ui('day'),
			{
				'base-event-calendar__day--today': day.isToday,
				'base-event-calendar__day--outside': day.isOutside,
				'base-event-calendar__day--selected': sources.isDaySelected(day),
			},
		],
		headerDayClass: (day: EventCalendarTimeDay) => [
			ui('header-day'),
			{
				'base-event-calendar__header-day--today': day.isToday,
				'base-event-calendar__header-day--resource-start': day.isResourceStart,
			},
		],
		columnClass: (day: EventCalendarTimeDay, hasWorkHours: boolean) => [
			ui('column'),
			{
				'base-event-calendar__column--today': day.isToday,
				'base-event-calendar__column--work-hours': hasWorkHours,
				'base-event-calendar__column--resource-start': day.isResourceStart,
			},
		],
		barClass: (segment: CalendarWeekSegment, isMonth: boolean) => [
			ui('event'),
			'base-event-calendar__event--bar',
			classes.value.event,
			{
				'base-event-calendar__event--timed': isMonth && !segment.item.allDay && segment.span === 1,
				'base-event-calendar__event--continued': !segment.isStart,
				'base-event-calendar__event--continuing': !segment.isEnd,
			},
			editClass(segment.item),
		],
		blockClass: (segment: CalendarTimeSegment) => [
			ui('event'),
			'base-event-calendar__event--block',
			classes.value.event,
			editClass(segment.item),
			{ 'base-event-calendar__event--compact': sources.isCompact(segment) },
		],
		itemClass: () => [ui('event'), 'base-event-calendar__event--item', classes.value.event],
	}
}
