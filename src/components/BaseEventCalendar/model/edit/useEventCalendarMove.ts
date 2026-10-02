import { shallowRef } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_EVENT_CALENDAR } from '@/locales/messages'
import { focusIn, formatRange } from './eventCalendarEditDom'
import { findResource, neighborColumn } from '../eventCalendarResources'
import type { NormalizedCalendarEvent } from '@utils/calendar/eventUtils'
import { emitChange, isInPeriod, leastLength, makeDraft, movedTime, resizedTime, shiftBetween, shiftDate } from './eventCalendarChange'
import type {
	EventCalendarAnnouncement,
	EventCalendarContext,
	EventCalendarDraft,
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

function nextTime(
	current: EventCalendarTime,
	grab: EventCalendarGrab,
	move: { by: EventCalendarShift; isResize: boolean; step: number },
): EventCalendarTime {
	if (!move.isResize) return { ...movedTime(current, move.by), resourceId: current.resourceId }
	return { ...resizedTime(current, shiftDate(current.end, move.by), leastLength(grab.kind, move.step)), resourceId: current.resourceId }
}

function columnTime(context: EventCalendarContext, current: EventCalendarTime, key: string): EventCalendarTime | null {
	const direction = { ArrowLeft: -1, ArrowRight: 1 }[key]
	if (!direction) return null
	const next = neighborColumn(context, { date: current.start, resourceId: current.resourceId }, { direction })
	if (!next) return null
	return { ...movedTime(current, shiftBetween(current.start, next.date)), resourceId: next.resourceId }
}

const MAX_SKIPPED_STEPS = 100

function eventSelector(key: string): string {
	return `[data-event-key="${key.replace(/"/g, '\\"')}"]`
}

function announceMove(
	context: EventCalendarContext,
	message: EventCalendarAnnouncement,
	target: { item: NormalizedCalendarEvent; time: EventCalendarTime },
): void {
	const time = formatRange({ start: target.time.start, end: target.time.end, allDay: target.item.allDay })
	const resource = findResource(context, target.time.resourceId)
	const range = resource ? formatMessage(UI_EVENT_CALENDAR.RESOURCE_COLUMN, { resource: resource.title, day: time }) : time
	context.status.value = formatMessage(UI_EVENT_CALENDAR[message], { title: target.item.event.title, range })
}

function keyTime(
	context: EventCalendarContext,
	key: { event: KeyboardEvent; grab: EventCalendarGrab; current: EventCalendarTime; by: EventCalendarShift },
): EventCalendarTime {
	const { event, grab, current, by } = key
	const move = { by, isResize: event.shiftKey, step: context.step.value }
	const isColumnStep = context.resources.value.length > 0 && grab.kind !== 'month' && !event.shiftKey
	return (isColumnStep && columnTime(context, current, event.key)) || nextTime(current, grab, move)
}

function freeDraft(
	context: EventCalendarContext,
	key: { event: KeyboardEvent; grab: EventCalendarGrab; current: EventCalendarTime; by: EventCalendarShift },
): { time: EventCalendarTime; draft: EventCalendarDraft } | null {
	const first = keyTime(context, key)
	let time = first
	for (let skipped = 0; skipped < MAX_SKIPPED_STEPS && isInPeriod(context, time.start); skipped += 1) {
		const draft = makeDraft(context, key.grab.item, time)
		if (!draft.isBlocked) return { time, draft }
		time = keyTime(context, { ...key, current: time })
	}
	return isInPeriod(context, first.start) ? { time: first, draft: makeDraft(context, key.grab.item, first) } : null
}

function stepGrabbed(context: EventCalendarContext, event: KeyboardEvent, grab: EventCalendarGrab): void {
	const by = stepOf(grab.kind, event.key, context.step.value)
	const current = context.draft.value
	if (!by || !current) return
	event.preventDefault()
	const found = freeDraft(context, { event, grab, current, by })
	if (!found) return
	const { time, draft } = found
	if (draft.isBlocked) return announceMove(context, 'BLOCKED', { item: grab.item, time })
	context.draft.value = draft
	announceMove(context, 'MOVED', { item: grab.item, time })
	focusIn(context.rootRef.value, eventSelector(grab.item.key))
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
	const handleGrabbed = (event: KeyboardEvent, grab: EventCalendarGrab): void => {
		const actions: Record<string, () => void> = {
			Enter: () => release(grab, 'DROPPED'),
			Escape: () => release(grab, 'CANCELLED'),
			' ': () => undefined,
		}
		if (event.key === 'Tab') return release(grab, 'CANCELLED', false)
		if (!Object.hasOwn(actions, event.key)) return stepGrabbed(context, event, grab)
		event.preventDefault()
		actions[event.key]()
	}
	const releaseIfLeft = (grab: EventCalendarGrab): void => {
		const active = context.rootRef.value?.ownerDocument.activeElement
		if (grabbed.value !== grab || (active instanceof HTMLElement && active.matches(eventSelector(grab.item.key)))) return
		release(grab, 'CANCELLED', false)
	}
	return {
		grabbedKey: (): string | null => grabbed.value?.item.key ?? null,
		handleEventFocusout(): void {
			const grab = grabbed.value
			if (grab) setTimeout(() => releaseIfLeft(grab))
		},
		handleEventKeydown(event: KeyboardEvent, item: NormalizedCalendarEvent, kind: EventCalendarEditKind): void {
			if (!context.props.isEditable || event.isComposing) return
			if (grabbed.value?.item.key === item.key) return handleGrabbed(event, grabbed.value)
			if (grabbed.value) release(grabbed.value, 'CANCELLED', false)
			if (event.key !== ' ') return
			event.preventDefault()
			grabbed.value = { item, kind }
			const resourceId = context.resources.value.length ? item.event.resourceId : undefined
			context.draft.value = { key: item.key, start: item.start, end: item.end, isBlocked: false, resourceId }
			announce('PICKED', item)
		},
	}
}
