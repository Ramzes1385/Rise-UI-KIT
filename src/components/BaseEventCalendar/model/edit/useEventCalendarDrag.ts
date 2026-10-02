import { ref } from 'vue'
import { addDays } from '@utils/calendar/eventUtils'
import { MINUTE, slotLocator } from './eventCalendarEditDom'
import { useEventCalendarPointer } from './useEventCalendarPointer'
import type { NormalizedCalendarEvent } from '@utils/calendar/eventUtils'
import { emitChange, leastLength, makeDraft, movedTime, resizedTime, shiftBetween } from './eventCalendarChange'
import type {
	EventCalendarContext,
	EventCalendarEditKind,
	EventCalendarPress,
	EventCalendarTime,
	ScreenPoint,
} from '../../types/BaseEventCalendarModel.types'

const DRAG_THRESHOLD = 5

const RESIZE_HANDLE = '.base-event-calendar__resize'

function slotEnd(slot: Date, kind: EventCalendarEditKind, step: number): Date {
	return kind === 'time' ? new Date(slot.getTime() + step * MINUTE) : addDays(slot, 1)
}

function draggedTime(context: EventCalendarContext, press: EventCalendarPress, slot: Date): EventCalendarTime {
	const step = context.step.value
	if (press.isResize) return resizedTime(press.item, slotEnd(slot, press.kind, step), leastLength(press.kind, step))
	return movedTime(press.item, shiftBetween(press.origin, slot))
}

export function useEventCalendarDrag(context: EventCalendarContext) {
	const track = useEventCalendarPointer()
	const dragging = ref<string | null>(null)
	let isClickSuppressed = false
	const stop = (): void => {
		context.draft.value = null
		dragging.value = null
	}
	const follow = (press: EventCalendarPress, point: ScreenPoint): void => {
		if (!dragging.value && Math.hypot(point.x - press.point.x, point.y - press.point.y) < DRAG_THRESHOLD) return
		dragging.value = press.item.key
		const slot = slotLocator(context, press.kind)(point)
		if (slot) context.draft.value = makeDraft(context, press.item, draggedTime(context, press, slot))
	}
	const drop = (press: EventCalendarPress): void => {
		isClickSuppressed = Boolean(dragging.value)
		setTimeout(() => {
			isClickSuppressed = false
		})
		const draft = context.draft.value
		stop()
		emitChange(context, press.item, draft)
	}
	return {
		dragging,
		isClickSuppressed: (): boolean => isClickSuppressed,
		handleEventPointerDown(event: PointerEvent, item: NormalizedCalendarEvent, kind: EventCalendarEditKind): void {
			if (!context.props.isEditable || event.button !== 0 || event.pointerType === 'touch') return
			const point = { x: event.clientX, y: event.clientY }
			const origin = slotLocator(context, kind)(point)
			if (!origin) return
			const isResize = Boolean((event.target as HTMLElement).closest(RESIZE_HANDLE))
			const press: EventCalendarPress = { item, kind, origin, point, isResize }
			track({ move: next => follow(press, next), up: () => drop(press), cancel: stop })
		},
	}
}
