import { nextTick, ref } from 'vue'
import type { CalendarEvent } from '@utils/calendar/eventUtils'
import type { EventCalendarResource } from '../../../types/BaseEventCalendar.types'

const TITLES = ['Планёрка', 'Созвон с клиентом', 'Ревью кода', 'Собеседование', 'Демо', 'Обучение', 'Разбор задач']

const resources: EventCalendarResource[] = [
	{ id: 'anna', title: 'Анна' },
	{ id: 'ivan', title: 'Иван' },
	{ id: 'maria', title: 'Мария' },
	{ id: 'oleg', title: 'Олег' },
]

function createEvents(count: number): CalendarEvent[] {
	return Array.from({ length: count }, (_, index) => {
		const round = Math.floor(index / 92)
		const start = new Date(2026, 8, 1 + (index % 92), 8 + (round % 10), (round % 2) * 30)
		return {
			id: index + 1,
			title: `${TITLES[index % TITLES.length]} №${index + 1}`,
			start,
			end: new Date(start.getTime() + 45 * 60 * 1000),
			resourceId: resources[round % resources.length].id,
		}
	})
}

export function setup() {
	const events = ref(createEvents(1200))
	const renderTime = ref(0)

	function measure(): void {
		const started = performance.now()
		void nextTick(() => {
			renderTime.value = Math.round(performance.now() - started)
		})
	}

	return { resources, events, renderTime, measure }
}
