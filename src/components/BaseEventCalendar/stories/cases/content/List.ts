import { expect, within } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseEventCalendar.stories'

export const List: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Вид «Список» (повестка): дни месяца, в которых есть события; многодневное событие — в каждом своём дне.',
					'У события — время «10:00–11:00» или «Весь день». Каждый день — список `ul` с датой в доступном имени.',
				].join('\n'),
			},
		},
	},
	args: { view: 'list' },
	play: async ({ canvas }) => {
		const friday = canvas.getByRole('list', { name: /^пятница, 2 октября/ })
		await expect(within(friday).getAllByRole('listitem')).toHaveLength(5)
		await expect(within(friday).getByRole('button', { name: 'Отпуск, 1 октября — 7 октября' })).toHaveTextContent('Весь день')
		await expect(canvas.getAllByRole('button', { name: /^Отпуск/ })).toHaveLength(7)
	},
}
