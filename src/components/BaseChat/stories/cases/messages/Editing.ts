import { getMessage } from '../../shared'
import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseChat.stories'
import { EDIT_MESSAGES } from '../../timeline'
import type { StoryObj } from '@storybook/vue3-vite'
import { within, screen, waitFor, expect } from 'storybook/test'

export const Editing: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Правка своего сообщения с текстом: «Другие действия» → «Изменить». Над полем появляется панель «Изменение сообщения»,',
					'поле заполняется текстом, а набранный до правки черновик возвращается после её конца. Enter эмитит `edit` с',
					'`messageId` и новым текстом, Escape или крестик панели отменяют правку. Приложение обновляет текст и ставит',
					'`isEdited` — у сообщения появляется пометка «изменено».',
				].join('\n'),
			},
		},
	},
	args: { messages: EDIT_MESSAGES, quickReplies: [] },
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const field = canvas.getByRole('textbox', { name: 'Сообщение' })
		const more = within(getMessage(canvasElement, 'e2')).getByRole('button', { name: 'Другие действия с сообщением' })
		await tabTo(more, userEvent, 30)
		await userEvent.keyboard('{Enter}')
		const menu = await screen.findByRole('menu', { name: 'Действия с сообщением' })
		await waitFor(() => expect(within(menu).getAllByRole('menuitem')[0]).toHaveFocus())
		await userEvent.keyboard('{End}{ArrowUp}')
		await expect(within(menu).getByRole('menuitem', { name: 'Изменить' })).toHaveFocus()
		await userEvent.keyboard('{Enter}')

		await expect(await canvas.findByText('Изменение сообщения')).toBeInTheDocument()
		await expect(canvas.getByRole('button', { name: 'Отменить изменение сообщения' })).toBeInTheDocument()
		await expect(canvas.getByRole('button', { name: 'Сохранить изменение сообщения' })).toBeInTheDocument()
		await waitFor(() => expect(field).toHaveValue('Отчёт пришлю до конца дня'))
		await waitFor(() => expect(field).toHaveFocus())

		await userEvent.keyboard(' сегодня{Enter}')
		await expect(args.onEdit).toHaveBeenCalledWith({ messageId: 'e2', text: 'Отчёт пришлю до конца дня сегодня' })
		await waitFor(() => expect(canvas.queryByText('Изменение сообщения')).not.toBeInTheDocument())
		const edited = getMessage(canvasElement, 'e2')
		await waitFor(() => expect(within(edited).getByText('Отчёт пришлю до конца дня сегодня')).toBeInTheDocument())
		await expect(within(edited).getByText('изменено')).toBeInTheDocument()

		await userEvent.type(field, 'Черновик ответа')
		await userEvent.click(within(getMessage(canvasElement, 'e4')).getByRole('button', { name: 'Другие действия с сообщением' }))
		const secondMenu = await screen.findByRole('menu', { name: 'Действия с сообщением' })
		await userEvent.click(within(secondMenu).getByRole('menuitem', { name: 'Изменить' }))
		await waitFor(() => expect(field).toHaveValue('Таблица в общей папке'))
		await waitFor(() => expect(field).toHaveFocus())

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(canvas.queryByText('Изменение сообщения')).not.toBeInTheDocument())
		await expect(field).toHaveValue('Черновик ответа')
		await expect(args.onEdit).toHaveBeenCalledTimes(1)
	},
}
