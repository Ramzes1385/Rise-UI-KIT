import type meta from '../BaseConfirm.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, within, waitFor, expect } from 'storybook/test'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: кнопка открывает окно, `isOpen` синхронизирован с Controls. Результат — события `confirm`, `cancel`',
					'и `close(result)` в панели Actions.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Опубликовать серию' })
		await userEvent.click(trigger)
		const dialog = await screen.findByRole('alertdialog', { name: 'Опубликовать серию?' })
		await userEvent.click(within(dialog).getByRole('button', { name: 'Опубликовать' }))

		await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}
