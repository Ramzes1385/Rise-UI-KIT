import type { CalendarEvent } from '@utils/calendar/eventUtils'

export const STORY_EVENTS: CalendarEvent[] = [
	{ id: 'vacation', title: 'Отпуск', start: '2026-10-01', end: '2026-10-08', color: 'var(--rise-success)' },
	{ id: 'standup', title: 'Встреча с командой', start: '2026-10-02T10:00', end: '2026-10-02T11:00', category: 'meeting' },
	{ id: 'lunch', title: 'Обед с заказчиком', start: '2026-10-02T10:30', end: '2026-10-02T12:00', color: 'var(--rise-warning)' },
	{ id: 'call', title: 'Созвон с подрядчиком', start: '2026-10-02T13:00', end: '2026-10-02T13:30', category: 'meeting' },
	{ id: 'review', title: 'Ревью дизайна', start: '2026-10-02T14:00', end: '2026-10-02T15:00', color: 'var(--rise-info)' },
	{ id: 'release', title: 'Ночной релиз', start: '2026-10-06T22:00', end: '2026-10-07T02:00', color: 'var(--rise-error)' },
	{ id: 'conference', title: 'Конференция Frontend Conf', start: '2026-10-14', end: '2026-10-17', color: 'var(--rise-info)' },
	{ id: 'birthday', title: 'День рождения Анны', start: '2026-10-22', allDay: true, color: 'var(--rise-warning)' },
]

export function getDay(canvasElement: HTMLElement, key: string): HTMLElement {
	return canvasElement.querySelector(`[data-day="${key}"]`) as HTMLElement
}
