import { expect } from 'storybook/test'
import type meta from '../BaseKbd.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: клавиша из `value`.' } } },
	play: async ({ canvasElement }) => {
		const kbd = canvasElement.querySelector('kbd') as HTMLElement
		await expect(kbd).toHaveTextContent('K')
	},
}
