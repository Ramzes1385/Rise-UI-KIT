import { expect } from 'storybook/test'
import type { SearchArgs } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<SearchArgs> = {
	parameters: { docs: { description: { story: 'Отключённый поиск: поле приглушено и недоступно для ввода.' } } },
	args: { modelValue: 'Лисья тропа', isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByPlaceholderText('Поиск по проекту')).toBeDisabled()
	},
}
