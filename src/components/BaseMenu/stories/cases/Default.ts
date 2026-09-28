import { ITEMS } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: клик по пункту эмитит `select` с этим пунктом.' } } },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Скачать' }))
		await expect(args.onSelect).toHaveBeenCalledWith(ITEMS[0][1])
	},
}
