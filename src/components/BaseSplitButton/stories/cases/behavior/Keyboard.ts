import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseSplitButton.stories'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Клавиатура: Tab — основная кнопка, Tab — кнопка меню, Enter открывает меню с фокусом на первом пункте.',
			},
		},
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		await tabTo(canvas.getByRole('button', { name: 'Сохранить' }), userEvent)
		await userEvent.tab()
		const toggle = canvas.getByRole('button', { name: 'Другие действия' })
		await expect(toggle).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(document.querySelector('[role="menuitem"]')).toHaveFocus())
		await userEvent.keyboard('{Escape}')
		await expect(toggle).toHaveFocus()
	},
}
