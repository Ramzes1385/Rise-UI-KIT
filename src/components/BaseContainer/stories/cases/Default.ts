import { expect } from 'storybook/test'
import type meta from '../BaseContainer.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: меняйте `size` в Controls.' } } },
	play: async ({ canvasElement }) => {
		const container = canvasElement.querySelector('.base-container') as HTMLElement
		await expect(getComputedStyle(container).maxWidth).toBe('768px')
		await expect(getComputedStyle(container).marginLeft).toBe(getComputedStyle(container).marginRight)
	},
}
