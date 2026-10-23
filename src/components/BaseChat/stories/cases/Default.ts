import type meta from '../BaseChat.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: напишите сообщение и нажмите Enter — оно появится в ленте. Реакции, удаление и закреп тоже работают:',
					'пример обновляет список сообщений по событиям, как это делает приложение.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('textbox', { name: 'Сообщение' })
		await userEvent.type(field, 'Макеты обновил, посмотри{Enter}')
		await expect(args.onSend).toHaveBeenCalledWith(expect.objectContaining({ text: 'Макеты обновил, посмотри' }))
		await expect(field).toHaveValue('')
		const log = canvas.getByRole('log', { name: 'Сообщения' })
		await waitFor(() => expect(within(log).getByText('Макеты обновил, посмотри')).toBeInTheDocument())
	},
}
