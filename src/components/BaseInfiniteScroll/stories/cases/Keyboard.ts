import { items, PAGE } from '../shared'
import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseInfiniteScroll.stories'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Клавиатура: в режиме manual Tab доходит до кнопки «Загрузить еще», Enter подгружает.' } },
	},
	tags: ['!autodocs'],
	args: { mode: 'manual' },
	play: async ({ canvas, canvasElement, userEvent }) => {
		await tabTo(canvas.getByRole('button', { name: 'Загрузить еще' }), userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(await canvas.findByRole('status')).toHaveTextContent('Загрузка...')
		await waitFor(() => expect(items(canvasElement)).toBe(PAGE * 2))
	},
}
