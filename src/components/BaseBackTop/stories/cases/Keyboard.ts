import { scrollList } from '../shared'
import type meta from '../BaseBackTop.stories'
import { waitFor, expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Клавиатура: Tab до кнопки, Enter — лента в начале, фокус в ленте.' } } },
	tags: ['!autodocs'],
	play: async ({ canvas, canvasElement, userEvent }) => {
		const list = await scrollList(canvasElement)
		const button = await canvas.findByRole('button', { name: 'Наверх' })
		button.focus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(list.scrollTop).toBe(0))
		await expect(list).toHaveFocus()
	},
}
