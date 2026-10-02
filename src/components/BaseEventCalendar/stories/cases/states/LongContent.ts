import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseEventCalendar.stories'

const longTitle = 'Стратегическая сессия руководителей направлений по итогам квартала и планированию бюджета'

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Длинные названия обрезаются многоточием в полосе и блоке события; полное название остаётся в доступном имени.',
			},
		},
	},
	args: {
		view: 'week',
		events: [
			{ id: 'session', title: longTitle, start: '2026-10-02T10:00', end: '2026-10-02T12:00' },
			{ id: 'offsite', title: `${longTitle} — выездная часть`, start: '2026-09-30', end: '2026-10-03', color: 'var(--rise-success)' },
		],
	},
	play: async ({ canvas }) => {
		const session = canvas.getByRole('button', { name: `${longTitle}, 2 октября, 10:00–12:00` })
		const title = session.querySelector('.base-event-calendar__event-title') as HTMLElement
		await expect(title.scrollWidth).toBeGreaterThan(title.clientWidth)
		await expect(session.getBoundingClientRect().right).toBeLessThanOrEqual(session.parentElement!.getBoundingClientRect().right + 1)
		await expect(canvas.getByRole('button', { name: /выездная часть, 30 сентября — 2 октября$/ })).toBeVisible()
	},
}
