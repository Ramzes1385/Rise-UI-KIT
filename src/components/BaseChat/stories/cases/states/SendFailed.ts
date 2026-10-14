import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseChat.stories'
import { expect, within } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { PRIVATE_MESSAGES, sentAt, getMessage } from '../../shared'

export const SendFailed: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Сообщение не отправлено: статус `failed` у своего сообщения. Под ним — «Не отправлено» (`role="status"`) и кнопки «Повторить» и «Удалить»;',
					'они вызывают события `retry-message` и `discard-message` с id сообщения (удаление — без подтверждения). Приложение само решает,',
					'что делать: отправить заново или убрать сообщение из ленты. Действия сообщения и контекстное меню у такого сообщения скрыты.',
				].join('\n'),
			},
		},
	},
	args: {
		messages: [
			...PRIVATE_MESSAGES.slice(0, 2),
			{ id: 'failed-1', sender: 'me', text: 'Выложил обновлённые макеты в общую папку.', status: 'failed', ...sentAt(9, 30) },
		],
		quickReplies: [],
	},
	play: async ({ canvasElement, userEvent, args }) => {
		const message = within(getMessage(canvasElement, 'failed-1'))
		await expect(message.getByRole('status')).toHaveTextContent('Не отправлено')
		await expect(message.queryByRole('button', { name: 'Другие действия с сообщением' })).not.toBeInTheDocument()

		const retry = message.getByRole('button', { name: 'Повторить отправку сообщения' })
		await tabTo(retry, userEvent, 30)
		await userEvent.keyboard('{Enter}')
		await expect(args['onRetry-message']).toHaveBeenCalledWith('failed-1')

		const discard = message.getByRole('button', { name: 'Удалить неотправленное сообщение' })
		await tabTo(discard, userEvent, 30)
		await userEvent.keyboard('{Enter}')
		await expect(args['onDiscard-message']).toHaveBeenCalledWith('failed-1')
	},
}
