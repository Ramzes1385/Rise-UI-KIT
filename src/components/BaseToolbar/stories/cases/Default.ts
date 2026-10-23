import { expect } from 'storybook/test'
import type meta from '../BaseToolbar.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: шесть кнопок и разделитель, в порядке Tab — одна кнопка.' } } },
	play: async ({ canvas }) => {
		const toolbar = canvas.getByRole('toolbar', { name: 'Форматирование' })
		const buttons = [...toolbar.querySelectorAll('button')]
		await expect(buttons.filter(button => button.tabIndex === 0)).toHaveLength(1)
	},
}
