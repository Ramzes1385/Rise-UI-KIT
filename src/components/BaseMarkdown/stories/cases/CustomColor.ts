import { expect } from 'storybook/test'
import type meta from '../BaseMarkdown.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Кастомный цвет через `color` — подложка варианта `soft` и цвет текста.' } },
	},
	args: { variant: 'soft', color: { bg: { base: '#6d28d9' }, text: { base: '#ffffff' } } },
	play: async ({ canvasElement }) => {
		const element = canvasElement.querySelector('.base-markdown') as HTMLElement
		await expect(getComputedStyle(element).backgroundColor).toBe('rgb(109, 40, 217)')
		await expect(getComputedStyle(element).color).toBe('rgb(255, 255, 255)')
	},
}
