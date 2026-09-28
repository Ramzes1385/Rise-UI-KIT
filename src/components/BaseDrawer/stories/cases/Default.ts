import type meta from '../BaseDrawer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, expect, within, waitFor } from 'storybook/test'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Песочница: нижний лист с фильтрами. Закрывается кнопкой, Escape, затемнением и перетаскиванием вниз.' },
		},
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Открыть фильтры' }))
		const dialog = await screen.findByRole('dialog', { name: 'Фильтры' })
		await expect(dialog).toHaveAccessibleDescription('Заказы за сентябрь')
		await userEvent.click(within(dialog).getByRole('button', { name: 'Закрыть' }))
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
	},
}
