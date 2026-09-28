import { expect } from 'storybook/test'
import type meta from '../BaseFab.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Extended: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Широкая кнопка (`isExtended`) с подписью — когда действие неочевидно по иконке.' } } },
	args: { isExtended: true, label: 'Написать', icon: 'send' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Написать' })).toHaveTextContent('Написать')
	},
}
