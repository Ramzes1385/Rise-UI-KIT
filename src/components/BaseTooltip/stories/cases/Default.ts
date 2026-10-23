import type meta from '../BaseTooltip.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: наведите курсор на кнопку — через 100 мс появится подсказка, при уходе курсора она скроется.',
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const button = canvas.getByRole('button', { name: 'Скопировать ссылку' })
		await userEvent.hover(button)
		await expect(await screen.findByRole('tooltip')).toHaveTextContent('Скопировать ссылку')

		await userEvent.unhover(button)
		await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument())
	},
}
