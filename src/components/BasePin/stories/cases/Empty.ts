import { expect } from 'storybook/test'
import type meta from '../BasePin.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Пустой код: все ячейки пустые, у каждой — доступное имя с позицией.' } } },
	play: async ({ canvas }) => {
		const cells = canvas.getAllByRole('textbox')
		await expect(cells).toHaveLength(4)
		for (const cell of cells) {
			await expect(cell).toHaveValue('')
		}
		await expect(canvas.getByRole('group')).toHaveAccessibleName('Код из СМС')
	},
}
