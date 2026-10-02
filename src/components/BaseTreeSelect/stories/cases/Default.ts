import type meta from '../BaseTreeSelect.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: раскройте округ стрелкой и выберите город — значение синхронизировано с Controls.',
					'Сценарий с клавиатурой — в истории Keyboard.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('combobox', { name: 'Город доставки' })
		await userEvent.click(trigger)
		const tree = await screen.findByRole('tree', { name: 'Город доставки' })
		await expect(trigger).toHaveAttribute('aria-controls', tree.id)
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
	},
}
