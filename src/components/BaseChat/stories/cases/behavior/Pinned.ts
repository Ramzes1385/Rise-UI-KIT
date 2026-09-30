import type meta from '../../BaseChat.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { GROUP_CHAT, GROUP_MESSAGES, getMessage } from '../../shared'

const PANEL = /^Закреплённое сообщение/

export const Pinned: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Закреплённые сообщения (`messages[].isPinned`) — панель под шапкой, как в Telegram: видно последнее закреплённое.',
					'Клик по панели плавно прокручивает ленту (только её, не страницу) к сообщению и переключает панель на предыдущее',
					'закреплённое — повторные клики обходят закрепы по кругу; стрелки листают их вручную. Администратор',
					"(`currentUserRole: 'admin'`) закрепляет из меню и открепляет крестиком.",
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
		await expect(canvas.getByRole('button', { name: PANEL })).toHaveAccessibleName(/\(3 из 3\)/)
		for (const [id, next] of [
			['g5', 2],
			['g3', 1],
			['g1', 3],
		] as const) {
			await userEvent.click(canvas.getByRole('button', { name: PANEL }))
			await expect(getMessage(canvasElement, id)).toHaveClass('base-chat-message-list__item--highlighted')
			await waitFor(() => expect(canvas.getByRole('button', { name: PANEL })).toHaveAccessibleName(new RegExp(`\\(${next} из 3\\)`)))
		}

		await userEvent.click(canvas.getByRole('button', { name: 'Предыдущее закреплённое сообщение' }))
		await waitFor(() => expect(canvas.getByRole('button', { name: PANEL })).toHaveAccessibleName(/\(2 из 3\)/))
		await userEvent.click(canvas.getByRole('button', { name: 'Открепить сообщение' }))
		await expect(args['onUnpin-message']).toHaveBeenCalledWith('g3')
		await waitFor(() => expect(canvas.getByRole('button', { name: PANEL })).toHaveAccessibleName(/\(2 из 2\)/))
	},
}
