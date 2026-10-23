import type meta from '../BaseSlideover.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, expect, within, waitFor } from 'storybook/test'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: кнопка открывает панель, `isOpen` синхронизирован с Controls. Панель закрывают «Закрыть» в шапке,',
					'Escape и клик по подложке; кнопки подвала закрывают её из кода примера.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Открыть фильтры' }))
		const dialog = await screen.findByRole('dialog', { name: 'Фильтры' })
		await expect(dialog).toHaveAttribute('aria-modal', 'true')

		await userEvent.click(within(dialog).getByRole('button', { name: 'Закрыть' }))
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
	},
}
