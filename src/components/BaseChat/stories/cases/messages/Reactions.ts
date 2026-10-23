import type meta from '../../BaseChat.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { within, expect, waitFor, screen } from 'storybook/test'
import { GROUP_CHAT, GROUP_MESSAGES, getMessage } from '../../shared'

export const Reactions: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Реакции — пилюли под сообщением; своя реакция — кнопка в нажатом состоянии (`aria-pressed`). Нажатие эмитит',
					'`message-reaction`, новую реакцию ставят из меню «Другие действия».',
				].join('\n'),
			},
		},
	},
	args: { ...GROUP_CHAT, messages: GROUP_MESSAGES.slice(0, 4) },
	play: async ({ canvasElement, userEvent, args }) => {
		const message = getMessage(canvasElement, 'g1')
		const party = within(message).getByRole('button', { name: 'Реакция 🎉: 1' })
		await expect(party).toHaveAttribute('aria-pressed', 'false')
		await userEvent.click(party)
		await expect(args['onMessage-reaction']).toHaveBeenCalledWith({ messageId: 'g1', emoji: '🎉' })
		await waitFor(() => expect(within(message).getByRole('button', { name: 'Реакция 🎉: 2' })).toHaveAttribute('aria-pressed', 'true'))

		await userEvent.click(within(message).getByRole('button', { name: 'Другие действия с сообщением' }))
		const menu = await screen.findByRole('menu', { name: 'Действия с сообщением' })
		await userEvent.click(within(menu).getByRole('menuitem', { name: 'Поставить реакцию ❤️' }))
		await waitFor(() => expect(within(message).getByRole('button', { name: 'Реакция ❤️: 1' })).toHaveAttribute('aria-pressed', 'true'))
	},
}
