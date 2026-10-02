import { formatMessage } from '@/locales/state'
import { UI_EVENT_CALENDAR } from '@/locales/messages'
import { computed, ref, shallowRef, useId } from 'vue'
import { useEventCalendarPointer } from './useEventCalendarPointer'
import { addDays, startOfDay, toDayKey } from '@utils/calendar/eventUtils'
import type { EventCalendarSelection } from '../../types/BaseEventCalendar.types'
import { DEFAULT_SCROLL_MINUTE, parseMinutes } from '../useEventCalendarTimeGrid'
import {
	DAY_CELL,
	MINUTE,
	TIME_COLUMN,
	atMinute,
	dayOf,
	focusIn,
	formatPosition,
	formatRange,
	isSameTime,
	minuteAt,
	minuteOf,
	slotLocator,
} from './eventCalendarEditDom'
import type {
	EventCalendarContext,
	EventCalendarMonthDay,
	EventCalendarSelectionApi,
	EventCalendarSelectionState,
	ScreenPoint,
	EventCalendarTimeDay,
} from '../../types/BaseEventCalendarModel.types'

const NAV_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'])

const SKIP_TARGETS = '.base-event-calendar__event, .base-event-calendar__more'

const MINUTES_PER_DAY = 1440

function toRange(state: EventCalendarSelectionState, step: number): EventCalendarSelection {
	const [first, last] = state.anchor <= state.focus ? [state.anchor, state.focus] : [state.focus, state.anchor]
	return { start: first, end: state.allDay ? addDays(last, 1) : new Date(last.getTime() + step * MINUTE), allDay: state.allDay }
}

function percent(value: number): string {
	return `${(value * 100).toFixed(4)}%`
}

function useSelectionState(context: EventCalendarContext): EventCalendarSelectionApi {
	const { emit, step, status } = context
	const selection = shallowRef<EventCalendarSelectionState | null>(null)
	const range = computed(() => (selection.value ? toRange(selection.value, step.value) : null))
	return {
		selection,
		range,
		update(state: EventCalendarSelectionState | null): void {
			selection.value = state
			if (range.value) status.value = formatMessage(UI_EVENT_CALENDAR.SELECTED, { range: formatRange(range.value) })
		},
		clear(): void {
			if (!selection.value) return
			selection.value = null
			status.value = UI_EVENT_CALENDAR.SELECTION_CLEARED
		},
		finish(state: EventCalendarSelectionState): void {
			const value = toRange(state, step.value)
			const isClick = isSameTime(state.anchor, state.focus)
			selection.value = isClick ? null : state
			if (isClick) emit('create', value)
			else emit('select', value)
		},
	}
}

function useSelectPointer(context: EventCalendarContext, api: EventCalendarSelectionApi, setCursor: (minute: number) => void) {
	const track = useEventCalendarPointer()
	const start = (state: EventCalendarSelectionState, locate: (point: ScreenPoint) => Date | null): void => {
		api.selection.value = state
		track({
			move(point) {
				const focus = locate(point)
				if (focus && api.selection.value) api.selection.value = { ...api.selection.value, focus }
			},
			up() {
				if (!api.selection.value) return
				if (!api.selection.value.allDay) setCursor(minuteOf(api.selection.value.focus))
				api.finish(api.selection.value)
			},
			cancel: () => api.clear(),
		})
	}
	const target = (event: PointerEvent, selector: string): HTMLElement | null => {
		const element = event.target as HTMLElement
		if (!context.props.isSelectable || event.button !== 0 || element.closest(SKIP_TARGETS)) return null
		return element.closest<HTMLElement>(selector)
	}
	return {
		handleMonthPointerDown(event: PointerEvent): void {
			const day = target(event, DAY_CELL)
			const date = day && dayOf(day)
			if (date) start({ anchor: date, focus: date, allDay: true }, slotLocator(context, 'month'))
		},
		handleTimePointerDown(event: PointerEvent): void {
			const column = target(event, TIME_COLUMN)
			const date = column && dayOf(column)
			if (!column || !date) return
			const anchor = atMinute(date, minuteAt(column, event.clientY, context.step.value))
			start({ anchor, focus: anchor, allDay: false }, slotLocator(context, 'time'))
		},
	}
}

function stepTime(context: EventCalendarContext, key: string, point: Date): Date | null {
	const step = context.step.value
	const minute = minuteOf(point)
	const { start, end } = context.period.value
	const steps: Record<string, () => Date | null> = {
		ArrowUp: () => (minute - step >= 0 ? atMinute(point, minute - step) : null),
		ArrowDown: () => (minute + step < MINUTES_PER_DAY ? atMinute(point, minute + step) : null),
		ArrowLeft: () => (addDays(point, -1) >= start ? addDays(point, -1) : null),
		ArrowRight: () => (addDays(point, 1) < end ? addDays(point, 1) : null),
	}
	return Object.hasOwn(steps, key) ? steps[key]() : null
}

function handleAction(api: EventCalendarSelectionApi, event: KeyboardEvent, current: EventCalendarSelectionState): boolean {
	if (event.key === 'Enter') api.finish(api.selection.value ?? current)
	else if (event.key === 'Escape' && api.selection.value) api.clear()
	else return false
	event.preventDefault()
	return true
}

function moveCursor(
	context: EventCalendarContext,
	api: EventCalendarSelectionApi,
	move: { event: KeyboardEvent; point: Date; next: Date },
): void {
	const { event, point, next } = move
	event.preventDefault()
	const previous = api.selection.value
	const anchor = previous && !previous.allDay ? previous.anchor : point
	if (toDayKey(next) !== toDayKey(point)) {
		context.setDate(next)
		focusIn(context.rootRef.value, `${TIME_COLUMN}[data-day="${toDayKey(next)}"]`)
	}
	api.update(event.shiftKey ? { anchor, focus: next, allDay: false } : null)
	if (!event.shiftKey) context.status.value = formatPosition(next)
}

function useSelectKeyboard(context: EventCalendarContext, api: EventCalendarSelectionApi) {
	const { props, date, status } = context
	const cursor = ref<number | null>(null)
	const activeColumn = ref<string | null>(null)
	let isKeepingStatus = false
	const initialMinute = (): number => {
		const minute = (props.workHours && parseMinutes(props.workHours.start)) ?? DEFAULT_SCROLL_MINUTE
		return Math.floor(minute / context.step.value) * context.step.value
	}
	const pointOf = (day: Date): Date => atMinute(day, cursor.value ?? initialMinute())
	return {
		cursor,
		activeColumn,
		setCursor: (minute: number): void => {
			cursor.value = minute
		},
		handleMonthKeydown(event: KeyboardEvent, move: (event: KeyboardEvent) => void): void {
			const isCell = (event.target as HTMLElement).getAttribute('role') === 'gridcell'
			const day = { anchor: date.value, focus: date.value, allDay: true }
			if (!props.isSelectable || !isCell) return move(event)
			if (handleAction(api, event, day)) return
			const previous = api.selection.value
			const anchor = previous?.allDay ? previous.anchor : date.value
			move(event)
			if (NAV_KEYS.has(event.key)) api.update(event.shiftKey ? { anchor, focus: date.value, allDay: true } : null)
		},
		handleColumnKeydown(event: KeyboardEvent, day: EventCalendarTimeDay): void {
			if (!props.isSelectable || event.target !== event.currentTarget) return
			const point = pointOf(day.date)
			if (handleAction(api, event, { anchor: point, focus: point, allDay: false })) return
			const next = stepTime(context, event.key, point)
			if (!next) return
			cursor.value = minuteOf(next)
			isKeepingStatus = event.shiftKey && toDayKey(next) !== toDayKey(point)
			moveCursor(context, api, { event, point, next })
		},
		handleColumnFocus(day: EventCalendarTimeDay): void {
			if (!props.isSelectable) return
			activeColumn.value = day.key
			cursor.value ??= initialMinute()
			if (day.key !== toDayKey(date.value)) context.setDate(day.date)
			if (!isKeepingStatus) status.value = formatPosition(pointOf(day.date))
			isKeepingStatus = false
		},
		handleColumnBlur(): void {
			activeColumn.value = null
		},
	}
}

function dayBand(range: { start: Date; end: Date }, day: Date) {
	const dayEnd = addDays(day, 1)
	const start = range.start > day ? range.start : day
	const end = range.end < dayEnd ? range.end : dayEnd
	if (start >= end) return null
	const top = (start.getTime() - day.getTime()) / MINUTE / MINUTES_PER_DAY
	return { top: percent(top), height: percent((end.getTime() - start.getTime()) / MINUTE / MINUTES_PER_DAY) }
}

export function useEventCalendarSelect(context: EventCalendarContext) {
	const api = useSelectionState(context)
	const keyboard = useSelectKeyboard(context, api)
	const { cursor, activeColumn } = keyboard
	return {
		...useSelectPointer(context, api, keyboard.setCursor),
		selectHintId: `${useId()}-select-hint`,
		handleMonthKeydown: keyboard.handleMonthKeydown,
		handleColumnKeydown: keyboard.handleColumnKeydown,
		handleColumnFocus: keyboard.handleColumnFocus,
		handleColumnBlur: keyboard.handleColumnBlur,
		isDaySelected(day: EventCalendarMonthDay): boolean {
			const range = api.range.value
			return Boolean(range?.allDay && day.date >= range.start && day.date < range.end)
		},
		selectionStyle(day: EventCalendarTimeDay) {
			const range = api.range.value
			return range && !range.allDay ? dayBand(range, startOfDay(day.date)) : null
		},
		cursorStyle(day: EventCalendarTimeDay) {
			if (activeColumn.value !== day.key || cursor.value === null) return null
			const start = atMinute(day.date, cursor.value)
			return dayBand({ start, end: new Date(start.getTime() + context.step.value * MINUTE) }, startOfDay(day.date))
		},
	}
}
