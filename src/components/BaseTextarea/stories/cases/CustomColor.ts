import { expect } from 'storybook/test'
import type meta from '../BaseTextarea.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Кастомный цвет фона и текста поля через `color` — например, для поля на брендовом фоне.' } },
	},
	args: {
		label: 'Пожелания к упаковке',
		modelValue: 'Подарочная упаковка, открытка без подписи',
		rows: 3,
		color: { bg: { base: '#fff7ed' }, text: { base: '#7c2d12' } },
	},
	play: async ({ canvas }) => {
		const field = canvas.getByLabelText('Пожелания к упаковке')
		await expect(getComputedStyle(field).backgroundColor).toBe('rgb(255, 247, 237)')
		await expect(getComputedStyle(field).color).toBe('rgb(124, 45, 18)')
	},
}
