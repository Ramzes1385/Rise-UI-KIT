import { expect } from 'storybook/test'
import type meta from '../../BaseStepper.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Кастомный цвет через `color`: `bg.base` (и `bg.hover`) — пройденные шаги, кольцо текущего и линия прогресса,',
					'`text.base` — галочка на заливке.',
				].join('\n'),
			},
		},
	},
	args: {
		modelValue: 3,
		color: {
			bg: { base: '#2563eb', hover: '#1d4ed8' },
			text: { base: '#ffffff' },
		},
	},
	play: async ({ canvas }) => {
		const completed = canvas.getByRole('button', { name: /Корзина/ }).querySelector('.base-stepper__indicator') as HTMLElement
		await expect(getComputedStyle(completed).backgroundColor).toBe('rgb(37, 99, 235)')
		await expect(getComputedStyle(completed).color).toBe('rgb(255, 255, 255)')
	},
}
