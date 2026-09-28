import { expect } from 'storybook/test'
import type meta from '../BasePin.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Password: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Скрытый ввод `type="password"`: символы заменяются точками — для PIN-кода карты или приложения.' } },
	},
	args: { type: 'password', modelValue: '48' },
	play: async ({ canvasElement }) => {
		const cells = canvasElement.querySelectorAll('input')
		await expect(cells).toHaveLength(4)
		for (const cell of Array.from(cells)) {
			await expect(cell).toHaveAttribute('type', 'password')
		}
	},
}
