import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseEventCalendar.stories'

export const Empty: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Пустой период: в списке — «Нет событий» (свой текст — слот `empty`), в месяце, неделе и дне — пустая сетка.',
					'Приложение загружает события по `period-change` и передаёт их в `events`.',
				].join('\n'),
			},
		},
	},
	args: { events: [], view: 'list' },
	play: async ({ canvas, args }) => {
		await expect(canvas.getByText('Нет событий')).toBeVisible()
		await expect(args['onPeriod-change']).toHaveBeenCalledWith(expect.objectContaining({ view: 'list' }))
		await expect(canvas.queryAllByRole('list')).toHaveLength(0)
	},
}
