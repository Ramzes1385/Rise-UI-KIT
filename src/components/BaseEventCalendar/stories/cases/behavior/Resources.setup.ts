import { ref } from 'vue'
import type { CalendarEvent } from '@utils/calendar/eventUtils'
import type { EventCalendarChange, EventCalendarResource, EventCalendarSelection } from '../../../types/BaseEventCalendar.types'

const resources: EventCalendarResource[] = [
	{ id: 'blue', title: 'Синяя переговорная', color: 'var(--rise-info)' },
	{ id: 'green', title: 'Зелёная переговорная', color: 'var(--rise-success)' },
	{ id: 'hall', title: 'Большой зал' },
]

const format = (date: Date): string => date.toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })

const roomName = (id?: string | number): string => resources.find(room => room.id === id)?.title ?? 'без комнаты'

export function setup() {
	const events = ref<CalendarEvent[]>([
		{ id: 'planning', title: 'Планёрка', start: '2026-10-02T10:00', end: '2026-10-02T11:00', resourceId: 'blue' },
		{ id: 'demo', title: 'Демо для заказчика', start: '2026-10-01T15:00', end: '2026-10-01T16:00', resourceId: 'blue' },
		{
			id: 'interview',
			title: 'Собеседование',
			start: '2026-10-02T11:00',
			end: '2026-10-02T12:00',
			resourceId: 'green',
			color: 'var(--rise-warning)',
		},
		{ id: 'workshop', title: 'Воркшоп по дизайну', start: '2026-10-02T13:00', end: '2026-10-02T15:00', resourceId: 'hall' },
		{ id: 'projector', title: 'Ремонт проектора', start: '2026-10-02', allDay: true, resourceId: 'hall' },
		{ id: 'vacation', title: 'Отпуск Анны', start: '2026-09-28', end: '2026-10-03' },
	])
	const log = ref('Перенесите событие в другую комнату или выделите время')

	function move({ type, event, start, end, resourceId, oldResourceId }: EventCalendarChange): void {
		events.value = events.value.map(item => (item.id === event.id ? { ...item, start, end, resourceId } : item))
		log.value = `${type}: «${event.title}», ${roomName(oldResourceId)} → ${roomName(resourceId)}, ${format(start)}`
	}

	function report(name: string, { start, end, resourceId }: EventCalendarSelection): void {
		log.value = `${name}: ${roomName(resourceId)}, ${format(start)} — ${format(end)}`
	}

	return { resources, events, log, move, report }
}
