import { expect } from 'storybook/test'
import type meta from '../../BaseCascader.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Кастомный цвет фона и текста поля через `color`.' } } },
	args: {
		modelValue: ['spb-region', 'petrogradsky'],
		color: { bg: { base: '#eff6ff' }, text: { base: '#1e3a8a' } },
	},
	play: async ({ canvas }) => {
		const field = canvas.getByRole('combobox', { name: 'Район доставки' })
		await expect(getComputedStyle(field).backgroundColor).toBe('rgb(239, 246, 255)')
		await expect(field).toHaveTextContent('Санкт-Петербург / Петроградский')
	},
}
