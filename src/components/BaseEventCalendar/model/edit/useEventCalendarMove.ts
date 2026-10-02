import { shallowRef } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_EVENT_CALENDAR } from '@/locales/messages'
import { focusIn, formatRange } from './eventCalendarEditDom'
import type { NormalizedCalendarEvent } from '@utils/calendar/eventUtils'
import { emitChange, isInPeriod, leastLength, makeDraft, movedTime, resizedTime, shiftDate } from './eventCalendarChange'
import type {
	EventCalendarAnnouncement,
	EventCalendarContext,
	EventCalendarEditKind,
	EventCalendarGrab,
	EventCalendarShift,
	EventCalendarTime,
} from '../../types/BaseEventCalendarModel.types'

function stepOf(kind: EventCalendarEditKind, key: string, step: number): EventCalendarShift | null {
	const days = (value: number): EventCalendarShift => ({ days: value, minutes: 0 })
	const steps: Record<string, EventCalendarShift | null> = {
		ArrowLeft: days(-1),
		ArrowRight: days(1),
		ArrowUp: { month: days(-7), 'all-day': null, time: { days: 0, minutes: -step } }[kind],
		ArrowDown: { month: days(7), 'all-day': null, time: { days: 0, minutes: step } }[kind],
	}
	return Object.hasOwn(steps, key) ? steps[key] : null
}

function nextTime(current: EventCalendarTime, grab: EventCalendarGrab, move: { by: EventCalendarShift; isResize: boolean; step: number }) {
	if (!move.isResize) return movedTime(current, move.by)
	return resizedTime(current, shiftDate(current.end, move.by), leastLength(grab.kind, move.step))
}

function eventSelector(key: string): string {
	return `[data-event-key="${key.replace(/"/g, '\\"')}"]`
}

function announceMove(
	context: EventCalendarContext,
	message: EventCalendarAnnouncement,
	target: { item: NormalizedCalendarEvent; time: EventCalendarTime },
): void {
	const range = formatRange({ start: target.time.start, end: target.time.end, allDay: target.item.allDay })
	context.status.value = formatMessage(UI_EVENT_CALENDAR[message], { title: target.item.event.title, range })
}

export function useEventCalendarMove(context: EventCalendarContext) {
	const grabbed = shallowRef<EventCalendarGrab | null>(null)
	const announce = (message: EventCalendarAnnouncement, item: NormalizedCalendarEvent, time: EventCalendarTime = item): void =>
		announceMove(context, message, { item, time })
	const release = (grab: EventCalendarGrab, message: EventCalendarAnnouncement, isFocusKept = true): void => {
		const draft = context.draft.value
		context.draft.value = null
		grabbed.value = null
		if (message === 'DROPPED' && draft) announce(emitChange(context, grab.item, draft) ? 'DROPPED' : 'CANCELLED', grab.item, draft)
		else announce(message, grab.item)
		if (isFocusKept) focusIn(context.rootRef.value, eventSelector(grab.item.key))
	}
	const step = (event: KeyboardEvent, grab: EventCalendarGrab): void => {
		const by = stepOf(grab.kind, event.key, context.step.value)
		const current = context.draft.value
		if (!by || !current) return
		event.preventDefault()
		const time = nextTime(current, grab, { by, isResize: event.shiftKey, step: context.step.value })
		if (!isInPeriod(context, time.start)) return
		const draft = makeDraft(context, grab.item, time)
		if (draft.isBlocked) return announce('BLOCKED', grab.item, time)
		context.draft.value = draft
		announce('MOVED', grab.item, time)
		focusIn(context.rootRef.value, eventSelector(grab.item.key))
	}
	const handleGrabbed = (event: KeyboardEvent, grab: EventCalendarGrab): void => {
		const actions: Record<string, () => void> = {
			Enter: () => release(grab, 'DROPPED'),
			Escape: () => release(grab, 'CANCELLED'),
			' ': () => undefined,
		}
		if (event.key === 'Tab') return release(grab, 'CANCELLED', false)
		if (!Object.hasOwn(actions, event.key)) return step(event, grab)
		event.preventDefault()
		actions[event.key]()
	}
	return {
		grabbedKey: (): string | null => grabbed.value?.item.key ?? null,
		handleEventKeydown(event: KeyboardEvent, item: NormalizedCalendarEvent, kind: EventCalendarEditKind): void {
			if (!context.props.isEditable || event.isComposing) return
			if (grabbed.value) return handleGrabbed(event, grabbed.value)
			if (event.key !== ' ') return
			event.preventDefault()
			grabbed.value = { item, kind }
			context.draft.value = { key: item.key, start: item.start, end: item.end, isBlocked: false }
			announce('PICKED', item)
		},
	}
}
