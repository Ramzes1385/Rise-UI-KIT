import { tabTo } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseNotification.stories'
import { within, expect, waitFor } from 'storybook/test'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Клавиатура: Tab ставит фокус на кнопку «Закрыть» (видно кольцо фокуса), Enter закрывает уведомление.' },
		},
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const item = await canvas.findByRole('status')
		const close = within(item).getByRole('button', { name: 'Закрыть' })
		await tabTo(close, userEvent)
		await expect(getComputedStyle(close).outlineStyle).toBe('solid')

		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.queryByRole('status')).not.toBeInTheDocument())
	},
}
