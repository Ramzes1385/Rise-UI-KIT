import type meta from '../BasePopover.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: клик по кнопке открывает поповер под ней, повторный клик, клик снаружи или Escape — закрывают.',
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Автосохранение' })
		await userEvent.click(trigger)
		await expect(await screen.findByText(/Изменения сохраняются/)).toBeInTheDocument()

		await userEvent.click(trigger)
		await waitFor(() => expect(screen.queryByText(/Изменения сохраняются/)).not.toBeInTheDocument())
	},
}
