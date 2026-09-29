import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseChat.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { PRIVATE_MESSAGES, getMessage } from '../../shared'
import { within, screen, waitFor, expect } from 'storybook/test'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: действия сообщения доступны по Tab (панель действий появляется при фокусе), «Другие действия» открывает',
					'меню — фокус на первом пункте, стрелки и Home/End перемещают, Escape закрывает и возвращает фокус на кнопку.',
					'В поле ввода Enter отправляет сообщение.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	args: { messages: PRIVATE_MESSAGES.slice(0, 2), quickReplies: [] },
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const more = within(getMessage(canvasElement, 'p2')).getByRole('button', { name: 'Другие действия с сообщением' })
		await tabTo(more, userEvent, 30)
		await userEvent.keyboard('{Enter}')
		const menu = await screen.findByRole('menu', { name: 'Действия с сообщением' })
		const items = within(menu).getAllByRole('menuitem')
		await waitFor(() => expect(items[0]).toHaveFocus())
		await userEvent.keyboard('{End}')
		await expect(within(menu).getByRole('menuitem', { name: 'Удалить' })).toHaveFocus()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
		await expect(more).toHaveFocus()

		const field = canvas.getByRole('textbox', { name: 'Сообщение' })
		await tabTo(field, userEvent)
		await userEvent.keyboard('Созвонимся в 15:00?{Enter}')
		await expect(args.onSend).toHaveBeenCalledWith(expect.objectContaining({ text: 'Созвонимся в 15:00?' }))
	},
}
