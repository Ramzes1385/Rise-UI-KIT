import { getDay } from '../../shared'
import { expect, within } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseEventCalendar.stories'

export const Recurring: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Повторы — `rrule` (подмножество RRULE: `FREQ`, `INTERVAL`, `BYDAY`, `COUNT`, `UNTIL`) и `exdates` — пропущенные',
					'повторы. Повторы разворачиваются только в показанном периоде, `event-click` получает время нажатого повтора.',
					'Планёрка — по понедельникам и средам, 14 октября отменена; оплата аренды — 5-го числа, 6 раз.',
				].join('\n'),
			},
		},
	},
	args: {
		events: [
			{
				id: 'planning',
				title: 'Планёрка',
				start: '2026-09-28T09:30',
				end: '2026-09-28T10:00',
				rrule: 'FREQ=WEEKLY;BYDAY=MO,WE',
				exdates: ['2026-10-14T09:30'],
			},
			{ id: 'rent', title: 'Оплата аренды', start: '2026-09-05', rrule: 'FREQ=MONTHLY;COUNT=6', color: 'var(--rise-warning)' },
		],
	},
	play: async ({ canvasElement }) => {
		await expect(within(getDay(canvasElement, '2026-10-12')).getByRole('button', { name: /^Планёрка/ })).toBeVisible()
		await expect(within(getDay(canvasElement, '2026-10-14')).queryByRole('button', { name: /^Планёрка/ })).toBeNull()
		await expect(
			within(getDay(canvasElement, '2026-10-05')).getByRole('button', { name: 'Оплата аренды, 5 октября, весь день' }),
		).toBeVisible()
	},
}
