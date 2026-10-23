import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../BaseHeader.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Клавиатура: Tab идёт по названию, ссылкам навигации и действиям слева направо.' } } },
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		await tabTo(canvas.getByRole('link', { name: 'Rise CRM' }), userEvent)
		await userEvent.tab()
		await expect(canvas.getByRole('link', { name: 'Заказы' })).toHaveFocus()
	},
}
