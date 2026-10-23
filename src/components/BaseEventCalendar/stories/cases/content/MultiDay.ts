import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseEventCalendar.stories'

export const MultiDay: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Многодневные события и события на весь день в неделе. День без времени (`ГГГГ-ММ-ДД`) — событие на весь день,',
					"`end` не входит в событие: конференция 14–16 октября — `end: '2026-10-17'`. Событие со временем через полночь",
					'(релиз 6 октября 22:00 — 7 октября 02:00) режется по дням и остаётся одним событием в доступном имени.',
				].join('\n'),
			},
		},
	},
	args: { view: 'week', date: '2026-10-06' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Отпуск, 1 октября — 7 октября' })).toHaveClass(
			'base-event-calendar__event--continued',
		)
		await expect(canvas.getAllByRole('button', { name: 'Ночной релиз, 6 октября, 22:00 — 7 октября, 02:00' })).toHaveLength(2)
	},
}
