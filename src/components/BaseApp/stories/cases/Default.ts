import type meta from '../BaseApp.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: кнопки показывают уведомления через `useToast()`. В Controls — настройки `toaster`:',
					'угол экрана, время показа, сколько уведомлений видно одновременно, оформление и масштаб.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Успех' }))
		await expect(await screen.findByRole('status')).toHaveTextContent('Серия опубликована')

		await userEvent.click(canvas.getByRole('button', { name: 'Закрыть все' }))
		await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
	},
}
