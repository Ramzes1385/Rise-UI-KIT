import { expect } from 'storybook/test'
import type meta from '../BaseReasoning.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Кастомный цвет через `color`. Для статусов берите токены ролей: `var(--rise-success-soft)`.' } },
	},
	args: { variant: 'soft', isOpen: true, color: { bg: { base: '#6d28d9' }, text: { base: '#ffffff' } } },
	play: async ({ canvasElement }) => {
		const element = canvasElement.querySelector('.base-reasoning') as HTMLElement
		await expect(getComputedStyle(element).backgroundColor).toBe('rgb(109, 40, 217)')
		await expect(getComputedStyle(element).color).toBe('rgb(255, 255, 255)')
	},
}
