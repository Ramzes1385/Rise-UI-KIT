import { getMessage } from '../shared'
import type meta from '../BaseChat.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { within, screen, expect, waitFor } from 'storybook/test'

export const Delete: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Удаление: «Другие действия» → «Удалить» открывает подтверждение (`BaseModal` внутри окна); `delete-messages`',
					'приходит только после подтверждения. Удалить можно своё сообщение, администратор — любое. Редактирования нет.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		await userEvent.click(within(getMessage(canvasElement, 'p6')).getByRole('button', { name: 'Другие действия с сообщением' }))
		const menu = await screen.findByRole('menu', { name: 'Действия с сообщением' })
		await userEvent.click(within(menu).getByRole('menuitem', { name: 'Удалить' }))

		const dialog = await canvas.findByRole('dialog', { name: 'Удалить сообщения?' })
		await expect(args['onDelete-messages']).not.toHaveBeenCalled()
		await userEvent.click(within(dialog).getByRole('button', { name: 'Удалить' }))
		await expect(args['onDelete-messages']).toHaveBeenCalledWith(['p6'])
		await waitFor(() => expect(canvas.queryByText('Принято, посмотрю после обеда.')).not.toBeInTheDocument())
	},
}
