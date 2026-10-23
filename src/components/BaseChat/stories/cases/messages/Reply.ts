import { getMessage } from '../../shared'
import type meta from '../../BaseChat.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { within, expect, waitFor } from 'storybook/test'

export const Reply: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Ответ: «Ответить» у сообщения показывает панель ответа над полем, `send` приходит с `replyToId`. Цитата в ответе —',
					'кнопка: клик прокручивает ленту к оригиналу и подсвечивает его.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const original = getMessage(canvasElement, 'p3')
		await userEvent.click(within(original).getByRole('button', { name: 'Ответить на сообщение' }))
		await expect(canvas.getByRole('button', { name: 'Отменить ответ на сообщение' })).toBeInTheDocument()

		await userEvent.type(canvas.getByRole('textbox', { name: 'Сообщение' }), 'Кнопки уже поправил{Enter}')
		await expect(args.onSend).toHaveBeenCalledWith(expect.objectContaining({ text: 'Кнопки уже поправил', replyToId: 'p3' }))
		await waitFor(() => expect(canvas.queryByRole('button', { name: 'Отменить ответ на сообщение' })).not.toBeInTheDocument())

		await userEvent.click(within(getMessage(canvasElement, 'p4')).getByRole('button', { name: /Две вещи/ }))
		await expect(original).toHaveClass('base-chat-message-list__item--highlighted')
	},
}
