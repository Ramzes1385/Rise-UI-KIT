import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDescriptions.stories'

export const Empty: StoryObj<typeof meta> = {
	args: { items: [], title: 'Реквизиты' },
	parameters: {
		docs: {
			description: {
				story: 'Полей нет — вместо списка текст «Нет данных» (`emptyText`) или своё содержимое в слоте `empty`.',
			},
		},
	},
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getByText('Нет данных')).toBeVisible()
		await expect(canvasElement.querySelector('dl')).toBeNull()
	},
}
