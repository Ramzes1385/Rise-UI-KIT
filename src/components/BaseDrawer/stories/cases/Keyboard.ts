import { tabTo } from '@/stories/helpers'
import type meta from '../BaseDrawer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, waitFor, expect } from 'storybook/test'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Клавиатура: Enter открывает панель, фокус внутри, Escape закрывает и возвращает фокус на кнопку.' },
		},
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Открыть фильтры' })
		await tabTo(trigger, userEvent)
		await userEvent.keyboard('{Enter}')
		const dialog = await screen.findByRole('dialog', { name: 'Фильтры' })
		await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true))
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await waitFor(() => expect(trigger).toHaveFocus())
	},
}
