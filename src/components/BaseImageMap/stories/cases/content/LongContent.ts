import { tabTo } from '@/stories/helpers'
import { IMAGE_MAP_LONG } from '../../fixtures'
import type meta from '../../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor, within } from 'storybook/test'

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Длинные название, подпись, описание с переносами строк: подсказка ограничена по ширине и переносит текст, подпись точки обрезается многоточием, подсказка прокручивается. Ссылки объекта — в окне (Enter или клик): в подсказке `role="tooltip"` интерактивного нет.',
			},
		},
	},
	args: { data: IMAGE_MAP_LONG },
	play: async ({ canvas, userEvent }) => {
		const trail = canvas.getByRole('button', { name: /Экологическая тропа/ })
		await tabTo(trail, userEvent)
		const tooltip = await screen.findByRole('tooltip')
		await expect(tooltip).toHaveTextContent(/Протяжённость маршрута/)
		await expect(trail).toHaveAttribute('aria-describedby', tooltip.id)
		await expect(within(tooltip).queryByRole('link')).toBeNull()
		await userEvent.keyboard('{Enter}')
		const dialog = await screen.findByRole('dialog')
		await expect(within(dialog).getByRole('link', { name: 'Прогноз погоды' })).toHaveAttribute('href', '#weather')
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(trail).toHaveFocus())
	},
}
