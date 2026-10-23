import { items, PAGE } from '../shared'
import { waitFor, expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseInfiniteScroll.stories'

export const Manual: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Режим `manual`: подгрузка по кнопке «Загрузить еще».' } } },
	args: { mode: 'manual' },
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Загрузить еще' }))
		await waitFor(() => expect(items(canvasElement)).toBe(PAGE * 2))
	},
}
