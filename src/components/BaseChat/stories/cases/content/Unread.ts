import type meta from '../../BaseChat.stories'
import { STORY_TODAY } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { UNREAD_LAST_READ, UNREAD_MESSAGES } from '../../timeline'

export const Unread: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Непрочитанные: перед первым чужим сообщением после `lastReadMessageId` стоит разделитель «N непрочитанных сообщений»,',
					'а лента при открытии прокручена к нему, а не к концу. Разделитель привязан к `lastReadMessageId`, поэтому',
					'отправка своего сообщения его не убирает: пометку «прочитано» ставит приложение, меняя этот проп.',
				].join('\n'),
			},
		},
	},
	args: {
		messages: UNREAD_MESSAGES,
		lastReadMessageId: UNREAD_LAST_READ,
		today: STORY_TODAY.toISOString(),
		quickReplies: [],
	},
	play: async ({ canvas, userEvent, args }) => {
		const log = canvas.getByRole('log', { name: 'Сообщения' })
		const separator = within(log).getByRole('separator', { name: '2 непрочитанных сообщения' })
		await waitFor(() => expect(log.scrollTop).toBeGreaterThan(0))
		await expect(separator).toBeInTheDocument()

		const field = canvas.getByRole('textbox', { name: 'Сообщение' })
		await userEvent.type(field, 'Посмотрю после обеда{Enter}')
		await expect(args.onSend).toHaveBeenCalledWith(expect.objectContaining({ text: 'Посмотрю после обеда' }))
		await waitFor(() => expect(within(log).getByText('Посмотрю после обеда')).toBeInTheDocument())
		await expect(within(log).getByRole('separator', { name: '2 непрочитанных сообщения' })).toBeInTheDocument()
	},
}
