import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../../BaseEventCalendar.stories'

export const Month: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Вид «Месяц»: шесть недель сетки. Многодневное событие — полоса через дни, обрезанная по неделе; событие со временем —',
					'точка цвета, время начала и название. В дне видно `maxEventsPerDay` рядов, остальные — за кнопкой «+N ещё»',
					'с поповером всех событий дня.',
				].join('\n'),
			},
		},
	},
	args: { view: 'month', maxEventsPerDay: 3 },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('grid')).toHaveAccessibleName('Октябрь 2026 г.')
		await expect(canvas.getAllByRole('columnheader')[0]).toHaveTextContent(/пн/i)
		await expect(canvas.getAllByRole('button', { name: 'Отпуск, 1 октября — 7 октября' })).toHaveLength(2)
		await expect(canvas.getByRole('button', { name: 'Встреча с командой, 2 октября, 10:00–11:00' })).toHaveAttribute('tabindex', '0')
		await expect(canvas.getByRole('button', { name: 'Все события дня: 2 октября' })).toHaveTextContent('+3 ещё')
	},
}
