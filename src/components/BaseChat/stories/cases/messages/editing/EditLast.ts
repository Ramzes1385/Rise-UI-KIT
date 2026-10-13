import { tabTo } from '@/stories/helpers'
import { getMessage } from '../../../shared'
import type meta from '../../../BaseChat.stories'
import { EDIT_MESSAGES } from '../../../timeline'
import type { StoryObj } from '@storybook/vue3-vite'
import { within, waitFor, expect } from 'storybook/test'

export const EditLast: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Правка последнего сообщения с клавиатуры: ArrowUp в пустом поле ввода открывает правку последнего своего отправленного',
					'сообщения с текстом (сообщения со статусом `sending` и `failed` пропускаются). Над полем появляется панель «Изменение',
					'сообщения», в поле — текст. Escape отменяет правку, и поле снова пустое; Enter после правки эмитит `edit` с `messageId`',
					'и новым текстом. В непустом поле ArrowUp работает как обычно — перемещает курсор.',
				].join('\n'),
			},
		},
	},
	args: { messages: EDIT_MESSAGES, quickReplies: [] },
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const field = canvas.getByRole('textbox', { name: 'Сообщение' })
		await tabTo(field, userEvent, 30)
		await expect(field).toHaveValue('')

		await userEvent.keyboard('{ArrowUp}')
		await expect(await canvas.findByText('Изменение сообщения')).toBeInTheDocument()
		await waitFor(() => expect(field).toHaveValue('Таблица в общей папке'))
		await waitFor(() => expect(field).toHaveFocus())

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(canvas.queryByText('Изменение сообщения')).not.toBeInTheDocument())
		await expect(field).toHaveValue('')
		await expect(args.onEdit).not.toHaveBeenCalled()

		await userEvent.keyboard('{ArrowUp}')
		await waitFor(() => expect(field).toHaveValue('Таблица в общей папке'))
		await waitFor(() => expect(field).toHaveFocus())
		await userEvent.keyboard(' с графиками{Enter}')
		await expect(args.onEdit).toHaveBeenCalledWith({ messageId: 'e4', text: 'Таблица в общей папке с графиками' })
		await waitFor(() => expect(canvas.queryByText('Изменение сообщения')).not.toBeInTheDocument())
		await waitFor(() =>
			expect(within(getMessage(canvasElement, 'e4')).getByText('Таблица в общей папке с графиками')).toBeInTheDocument(),
		)
		await expect(field).toHaveValue('')
	},
}
