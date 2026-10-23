import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseDropdown.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { waitFor, expect, screen } from 'storybook/test'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Tab ставит фокус на триггер, Enter открывает панель, Escape закрывает её (события `update:isOpen`',
					'и `close`), фокус всё это время остаётся на триггере; Space открывает панель снова.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Действия' })
		await tabTo(trigger, userEvent)

		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(screen.getByText('Скачать')).toBeVisible())
		await expect(trigger).toHaveFocus()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByText('Скачать')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()

		await userEvent.keyboard(' ')
		await waitFor(() => expect(screen.getByText('Скачать')).toBeVisible())
		await expect(trigger).toHaveFocus()
	},
}
