import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseEventCalendar.stories'

export const Day: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Вид «День»: одна колонка, шаг сетки 15 минут (`slotDuration`), рабочие часы и линия «Сейчас».',
			},
		},
	},
	args: { view: 'day', slotDuration: 15, workHours: { start: '09:00', end: '18:00' } },
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getAllByRole('group')).toHaveLength(1)
		const review = canvas.getByRole('button', { name: 'Ревью дизайна, 2 октября, 14:00–15:00' })
		await userEvent.click(review)
		await expect(args['onEvent-click']).toHaveBeenCalledWith(
			expect.objectContaining({ event: expect.objectContaining({ id: 'review' }) }),
		)
	},
}
