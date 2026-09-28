import { items, PAGE } from '../shared'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseInfiniteScroll.stories'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Прокрутите ленту вниз: заказы подгружаются по десять, после сорока — «Это все заказы».' } },
	},
	play: async ({ canvas, canvasElement }) => {
		const feed = canvas.getByRole('region', { name: 'Лента заказов' })
		await expect(items(canvasElement)).toBe(PAGE)
		feed.scrollTop = feed.scrollHeight
		await waitFor(() => expect(items(canvasElement)).toBeGreaterThan(PAGE), { timeout: 3000 })
	},
}
