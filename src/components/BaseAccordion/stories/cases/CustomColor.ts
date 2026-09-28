import { expect } from 'storybook/test'
import type meta from '../BaseAccordion.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Кастомный цвет через `color`: `bg.base` и `bg.hover` — фон заголовков и его наведение, `text.base` — цвет заголовков.',
			},
		},
	},
	args: {
		variant: 'outline',
		color: {
			bg: { base: '#eff6ff', hover: '#dbeafe' },
			text: { base: '#1e3a8a' },
		},
	},
	play: async ({ canvas }) => {
		const header = canvas.getByRole('button', { name: 'Как оформить заказ?' })
		await expect(getComputedStyle(header).backgroundColor).toBe('rgb(239, 246, 255)')
		await expect(getComputedStyle(header).color).toBe('rgb(30, 58, 138)')
	},
}
