import { expect } from 'storybook/test'
import type meta from '../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Недоступный объект: виден, но не выбирается.' } } },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Закрытая трасса' })).toHaveAttribute('aria-disabled', 'true')
	},
}
