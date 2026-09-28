import { tabTo } from '@/stories/helpers'
import type meta from '../BasePopover.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Клавиатура: Tab ставит фокус на кнопку-триггер, Enter открывает поповер, Escape закрывает его (событие `close`).',
			},
		},
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Автосохранение' })
		await tabTo(trigger, userEvent)

		await userEvent.keyboard('{Enter}')
		await expect(await screen.findByText(/Изменения сохраняются/)).toBeInTheDocument()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByText(/Изменения сохраняются/)).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}
