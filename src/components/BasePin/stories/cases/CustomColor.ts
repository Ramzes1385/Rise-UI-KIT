import { expect } from 'storybook/test'
import type meta from '../BasePin.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Кастомный цвет фона и текста ячеек через `color`.' } } },
	args: { modelValue: '4829', color: { bg: { base: '#eff6ff' }, text: { base: '#1e40af' } } },
	play: async ({ canvas }) => {
		const cell = canvas.getByRole('textbox', { name: 'Символ 1 из 4' })
		await expect(getComputedStyle(cell).backgroundColor).toBe('rgb(239, 246, 255)')
		await expect(getComputedStyle(cell).color).toBe('rgb(30, 64, 175)')
	},
}
