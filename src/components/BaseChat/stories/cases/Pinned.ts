import type meta from '../BaseChat.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { GROUP_CHAT, GROUP_MESSAGES, getMessage } from '../shared'

export const Pinned: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Закреплённые сообщения (`messages[].isPinned`) — панель под шапкой: стрелки листают закрепы, клик по панели',
					"прокручивает ленту к сообщению. Администратор (`currentUserRole: 'admin'`) закрепляет из меню и открепляет крестиком.",
				].join('\n'),
			},
		},
	},
	args: {
		...GROUP_CHAT,
		currentUserRole: 'admin',
		messages: GROUP_MESSAGES.map(message => (message.id === 'g3' || message.id === 'g5' ? { ...message, isPinned: true } : message)),
	},
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		await expect(canvas.getByRole('button', { name: /Закреплённое сообщение \(1 из 3\)/ })).toBeInTheDocument()
		await userEvent.click(canvas.getByRole('button', { name: 'Следующее закреплённое сообщение' }))
		const panel = canvas.getByRole('button', { name: /Закреплённое сообщение \(2 из 3\)/ })

		await userEvent.click(panel)
		await expect(getMessage(canvasElement, 'g3')).toHaveClass('base-chat-message-list__item--highlighted')

		await userEvent.click(canvas.getByRole('button', { name: 'Открепить сообщение' }))
		await expect(args['onUnpin-message']).toHaveBeenCalledWith('g3')
		await waitFor(() => expect(canvas.getByRole('button', { name: /Закреплённое сообщение \(2 из 2\)/ })).toBeInTheDocument())
	},
}
