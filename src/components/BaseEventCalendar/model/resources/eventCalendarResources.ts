import { formatMessage } from '@/locales/state'
import { UI_EVENT_CALENDAR } from '@/locales/messages'
import type { NormalizedCalendarEvent } from '@utils/calendar/eventUtils'
import { addDays, daysBetween, toDayKey } from '@utils/calendar/eventUtils'
import type { EventCalendarResource } from '../../types/BaseEventCalendar.types'
import type { EventCalendarContext, EventCalendarSlot, ResourceId } from '../../types/BaseEventCalendarModel.types'

export function columnKey(day: Date, resourceId?: ResourceId): string {
	return resourceId === undefined ? toDayKey(day) : `${String(resourceId)}|${toDayKey(day)}`
}

export function isSameResource(first: ResourceId, second: ResourceId): boolean {
	return first !== undefined && second !== undefined && String(first) === String(second)
}

export function findResource(context: EventCalendarContext, id: ResourceId): EventCalendarResource | null {
	return context.resources.value.find(resource => isSameResource(resource.id, id)) ?? null
}

export function itemsOfResource(
	items: readonly NormalizedCalendarEvent[],
	resource: EventCalendarResource | null,
): NormalizedCalendarEvent[] {
	return resource ? items.filter(item => isSameResource(item.event.resourceId, resource.id)) : [...items]
}

export function resourceOfElement(context: EventCalendarContext, element: HTMLElement): ResourceId {
	const value = element.dataset.resource
	return value === undefined ? undefined : (findResource(context, value)?.id ?? value)
}

export function neighborColumn(
	context: EventCalendarContext,
	slot: EventCalendarSlot,
	move: { direction: number; isSameResourceOnly?: boolean },
): EventCalendarSlot | null {
	const { direction, isSameResourceOnly = false } = move
	const { start, end } = context.period.value
	const dayCount = daysBetween(start, end)
	const dayIndex = daysBetween(start, slot.date)
	const resources = context.resources.value
	const resourceIndex = resources.findIndex(resource => isSameResource(resource.id, slot.resourceId))
	const index = Math.max(0, resourceIndex) * dayCount + dayIndex + direction
	const nextResource = Math.floor(index / dayCount)
	const count = Math.max(1, resources.length)
	if (index < 0 || nextResource >= count || (isSameResourceOnly && nextResource !== Math.max(0, resourceIndex))) return null
	const day = addDays(start, index % dayCount)
	const date = new Date(day.getFullYear(), day.getMonth(), day.getDate(), slot.date.getHours(), slot.date.getMinutes())
	return { date, resourceId: resources[nextResource]?.id }
}

export function columnName(label: string, resource: EventCalendarResource | null): string {
	return resource ? formatMessage(UI_EVENT_CALENDAR.RESOURCE_COLUMN, { resource: resource.title, day: label }) : label
}
