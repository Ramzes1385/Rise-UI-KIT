import { getMessage } from '../shared'
import type meta from '../BaseChat.stories'
import { within, expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Selection: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Выделение: «Выбрать» у сообщения включает режим выделения — у сообщений появляются чекбоксы, поле ввода сменяет',
					'тулбар «Переслать / Удалить / Отмена». Черновик в поле ввода при этом сохраняется.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const field = canvas.getByRole('textbox', { name: 'Сообщение' })
		await userEvent.type(field, 'Черновик ответа')

		await userEvent.click(within(getMessage(canvasElement, 'p2')).getByRole('button', { name: 'Выбрать сообщение' }))
		const toolbar = canvas.getByRole('group', { name: 'Действия с выбранными сообщениями' })
		await expect(within(toolbar).getByText('Выбрано: 1')).toBeInTheDocument()

		await userEvent.click(within(getMessage(canvasElement, 'p4')).getByRole('checkbox', { name: 'Выбрать сообщение' }))
		await expect(within(toolbar).getByText('Выбрано: 2')).toBeInTheDocument()

		await userEvent.click(within(toolbar).getByRole('button', { name: 'Переслать' }))
		await expect(args['onForward-messages']).toHaveBeenCalledWith(['p2', 'p4'])
		await expect(canvas.getByRole('textbox', { name: 'Сообщение' })).toHaveValue('Черновик ответа')
	},
}
