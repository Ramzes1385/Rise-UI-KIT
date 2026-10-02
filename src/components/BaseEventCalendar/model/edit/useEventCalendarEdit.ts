import { useId } from 'vue'
import { useEventCalendarDrag } from './useEventCalendarDrag'
import { useEventCalendarMove } from './useEventCalendarMove'
import type { EventCalendarContext } from '../../types/BaseEventCalendarModel.types'
import type { CalendarTimeSegment, CalendarWeekSegment, NormalizedCalendarEvent } from '@utils/calendar/eventUtils'

export function useEventCalendarEdit(context: EventCalendarContext, open: (item: NormalizedCalendarEvent) => void) {
	const { props, draft } = context
	const drag = useEventCalendarDrag(context)
	const move = useEventCalendarMove(context)
	return {
		editHintId: `${useId()}-edit-hint`,
		handleEventPointerDown: drag.handleEventPointerDown,
		handleEventKeydown: move.handleEventKeydown,
		handleEventFocusout: move.handleEventFocusout,
		handleEventClick(item: NormalizedCalendarEvent): void {
			if (!drag.isClickSuppressed() && !move.grabbedKey()) open(item)
		},
		editClass: (item: NormalizedCalendarEvent) => ({
			'base-event-calendar__event--grabbed': move.grabbedKey() === item.key,
			'base-event-calendar__event--dragging': drag.dragging.value === item.key,
			'base-event-calendar__event--blocked': draft.value?.key === item.key && draft.value.isBlocked,
		}),
		canResizeBar: (segment: CalendarWeekSegment): boolean => props.isEditable && segment.isEnd && segment.item.allDay,
		canResizeBlock: (segment: CalendarTimeSegment): boolean => props.isEditable && !segment.isContinuing,
	}
}
