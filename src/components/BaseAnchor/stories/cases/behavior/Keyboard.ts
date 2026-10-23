import type meta from '../../BaseAnchor.stories'
import { waitFor, expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Клавиатура: Tab по пунктам, Enter — переход к разделу, фокус на его заголовке.' } } },
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		await userEvent.tab()
		await expect(canvas.getByRole('link', { name: 'Введение' })).toHaveFocus()
		await userEvent.tab()
		await userEvent.tab()
		const npm = canvas.getByRole('link', { name: 'Через npm' })
		await expect(npm).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.getByRole('heading', { name: 'Через npm' })).toHaveFocus())
		await expect(npm).toHaveAttribute('aria-current', 'location')
	},
}
