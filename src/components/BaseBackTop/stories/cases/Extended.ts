import { scrollList } from '../shared'
import type meta from '../BaseBackTop.stories'
import { waitFor, expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Extended: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'С подписью (`isExtended`) и мягким вариантом.' } } },
	args: { isExtended: true, variant: 'soft', label: 'К началу ленты' },
	play: async ({ canvas, canvasElement }) => {
		await scrollList(canvasElement)
		const button = await canvas.findByRole('button', { name: 'К началу ленты' })
		await waitFor(() => expect(button).toBeVisible())
	},
}
