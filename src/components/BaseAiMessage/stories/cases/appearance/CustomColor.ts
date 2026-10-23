import { expect } from 'storybook/test'
import type meta from '../../BaseAiMessage.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Кастомный цвет через `color`: подложка пузыря варианта `soft` и цвет текста.' } } },
	args: { variant: 'soft', color: { bg: { base: '#6d28d9' }, text: { base: '#ffffff' } } },
	play: async ({ canvasElement }) => {
		const body = canvasElement.querySelector('.base-ai-message__body') as HTMLElement
		await expect(getComputedStyle(body).backgroundColor).toBe('rgb(109, 40, 217)')
		await expect(getComputedStyle(canvasElement.querySelector('.base-ai-message') as HTMLElement).color).toBe('rgb(255, 255, 255)')
	},
}
