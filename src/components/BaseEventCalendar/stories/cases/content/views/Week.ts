import { expect, within } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../../BaseEventCalendar.stories'

export const Week: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Вид «Неделя»: строка «Весь день» и сетка времени с шагом `slotDuration`. Пересекающиеся события делят колонку,',
					'рабочие часы `workHours` светлее остального времени, сетка открывается на их начале. Линия «Сейчас» — только',
					'в колонке сегодняшнего дня; здесь `today` со временем, поэтому линия неподвижна.',
				].join('\n'),
			},
		},
	},
	args: { view: 'week', workHours: { start: '09:00', end: '18:00' } },
	play: async ({ canvas }) => {
		const friday = canvas.getByRole('group', { name: /2 окт/ })
		await expect(within(friday).getByRole('button', { name: 'Встреча с командой, 2 октября, 10:00–11:00' })).toBeVisible()
		await expect(within(friday).getByRole('button', { name: 'Обед с заказчиком, 2 октября, 10:30–12:00' })).toBeVisible()
		await expect(within(friday).getByText('Сейчас')).toBeVisible()
		await expect(canvas.getByRole('button', { name: 'Отпуск, 1 октября — 7 октября' })).toBeVisible()
	},
}
