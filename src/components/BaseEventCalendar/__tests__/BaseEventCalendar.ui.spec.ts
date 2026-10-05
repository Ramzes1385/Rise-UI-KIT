import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { fireEvent, render } from '@testing-library/vue'
import BaseEventCalendar from '../ui/BaseEventCalendar.vue'
import type { CalendarEvent } from '@utils/calendar/eventUtils'
import { EVENT_CALENDAR_PARTS, type BaseEventCalendarProps } from '../types/BaseEventCalendar.types'

const EVENTS: CalendarEvent[] = [
	{ id: 'vacation', title: 'Отпуск', start: '2026-10-01', end: '2026-10-04', resourceId: 'a' },
	{ id: 'meeting', title: 'Встреча', start: '2026-10-02T10:00', end: '2026-10-02T11:00', resourceId: 'a' },
	{ id: 'lunch', title: 'Обед', start: '2026-10-02T10:30', end: '2026-10-02T12:00', resourceId: 'a' },
	{ id: 'call', title: 'Звонок', start: '2026-10-02T13:00', end: '2026-10-02T13:30', resourceId: 'a' },
]

const UI = Object.fromEntries(['root', ...EVENT_CALENDAR_PARTS].map(part => [part, `u-${part}`]))

const MONTH_PARTS = ['toolbar', 'nav', 'title', 'views', 'view', 'month', 'weekdays', 'weekday', 'week', 'day', 'day-number', 'lanes']
const EVENT_PARTS = ['event', 'event-title', 'more', 'more-button']
const TIME_PARTS = ['time-grid', 'resource-head', 'resource', 'time-head', 'header-day', 'all-day', 'all-day-label', 'all-day-events']
const GRID_PARTS = ['time-body', 'axis', 'axis-slot', 'column', 'now']

function renderCalendar(props: Partial<BaseEventCalendarProps> = {}, plugins: unknown[] = []) {
	return render(BaseEventCalendar, {
		props: { date: '2026-10-02', today: '2026-10-02T10:30', events: EVENTS, maxEventsPerDay: 2, ...props },
		global: { plugins: plugins as never[] },
	})
}

function part(container: Element, name: string): Element | null {
	return container.querySelector(name === 'root' ? '.base-event-calendar' : `.base-event-calendar__${name}`)
}

describe('BaseEventCalendar: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = renderCalendar()

		expect(part(container, 'view')).toHaveAttribute('class', 'base-event-calendar__view')
		expect(part(container, 'weekday')).toHaveAttribute('class', 'base-event-calendar__weekday')
		expect(part(container, 'day-number')).toHaveAttribute('class', 'base-event-calendar__day-number')
		expect(part(container, 'root')?.className).not.toMatch(/u-/)
		expect(part(container, 'month')?.innerHTML).not.toMatch(/u-/)
	})

	it('месяц и поповер: классы частей добавляются к классам кита, модификаторы и customClass сохраняются', async () => {
		const { container } = renderCalendar({ variant: 'soft', customClass: { root: 'own-root', event: 'own-event' }, ui: UI })

		expect(part(container, 'root')).toHaveClass('base-event-calendar', 'u-root', 'base-event-calendar--soft', 'own-root')
		for (const name of [...MONTH_PARTS, ...EVENT_PARTS]) expect(part(container, name), name).toHaveClass(`u-${name}`)
		expect(container.querySelector('[data-day="2026-10-02"]')).toHaveClass('u-day', 'base-event-calendar__day--today')
		expect(container.querySelector('.base-event-calendar__event--bar')).toHaveClass('u-event', 'own-event')
		await fireEvent.click(part(container, 'more-button')!)
		expect(document.querySelector('.base-event-calendar__popover')).toHaveClass('u-popover')
		expect(document.querySelector('.base-event-calendar__popover-title')).toHaveClass('u-popover-title')
		expect(document.querySelector('.base-event-calendar__popover .base-event-calendar__event--item')).toHaveClass(
			'u-event',
			'own-event',
		)
	})

	it('неделя с ресурсами и день: части сетки времени', () => {
		const { container } = renderCalendar({
			view: 'week',
			resources: [{ id: 'a', title: 'Зал' }],
			workHours: { start: '09:00', end: '18:00' },
			ui: UI,
		})

		for (const name of [...TIME_PARTS, ...GRID_PARTS]) expect(part(container, name), name).toHaveClass(`u-${name}`)
		expect(container.querySelector('.base-event-calendar__column--today')).toHaveClass(
			'u-column',
			'base-event-calendar__column--work-hours',
		)
		expect(container.querySelector('.base-event-calendar__header-day--today')).toHaveClass('u-header-day')
		expect(container.querySelector('.base-event-calendar__event--compact')).toHaveClass('u-event', 'base-event-calendar__event--block')
		expect(container.querySelector('.base-event-calendar__all-day-events .base-event-calendar__event--bar')).toHaveClass('u-event')
	})

	it('список и пустой список', () => {
		const { container } = renderCalendar({ view: 'list', ui: UI })

		for (const name of ['list', 'agenda-day', 'agenda-date', 'agenda-items', 'event', 'event-time', 'event-title']) {
			expect(part(container, name), name).toHaveClass(`u-${name}`)
		}
		const empty = renderCalendar({ view: 'list', events: [], ui: UI })
		expect(part(empty.container, 'empty')).toHaveClass('u-empty')
	})

	it('классы из defaults.BaseEventCalendar.ui плагина склеиваются с классами экземпляра', () => {
		const plugin = createUiKitPlugin({ defaults: { BaseEventCalendar: { ui: { root: 'app-root', day: 'app-day' } } } })
		const { container } = renderCalendar({ ui: { day: 'own-day' } }, [plugin])

		expect(part(container, 'root')).toHaveClass('base-event-calendar', 'app-root')
		expect(part(container, 'day')).toHaveClass('base-event-calendar__day', 'app-day', 'own-day')
	})
})
