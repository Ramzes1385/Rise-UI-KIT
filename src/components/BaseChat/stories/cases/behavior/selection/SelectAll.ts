import { tabTo } from '@/stories/helpers'
import type meta from '../../../BaseChat.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { within, waitFor, expect } from 'storybook/test'
import { PRIVATE_MESSAGES, getMessage } from '../../../shared'

export const SelectAll: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'«Выбрать всё»: в режиме выбора панель действий начинается с кнопки «Выбрать всё» — она отмечает все сообщения ленты (при',
					'поиске — только найденные) и эмитит `message-select` для каждого новоотмеченного. Когда выбраны все, кнопка становится',
					'недоступной (`aria-disabled`), но остаётся в порядке Tab и сохраняет фокус. Escape в ленте или на панели отменяет выбор',
					'и возвращает фокус в поле «Сообщение».',
				].join('\n'),
			},
		},
	},
	args: { messages: PRIVATE_MESSAGES, quickReplies: [] },
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const field = canvas.getByRole('textbox', { name: 'Сообщение' })
		await tabTo(within(getMessage(canvasElement, 'p2')).getByRole('button', { name: 'Выбрать сообщение' }), userEvent, 60)
		await userEvent.keyboard('{Enter}')

		const toolbar = canvas.getByRole('group', { name: 'Действия с выбранными сообщениями' })
		await expect(within(toolbar).getByText('Выбрано: 1')).toBeInTheDocument()
		const selectAll = within(toolbar).getByRole('button', { name: 'Выбрать всё' })
		await expect(selectAll).not.toHaveAttribute('aria-disabled', 'true')

		await tabTo(selectAll, userEvent, 30)
		await userEvent.keyboard('{Enter}')
		await expect(within(toolbar).getByText(`Выбрано: ${PRIVATE_MESSAGES.length}`)).toBeInTheDocument()
		await expect(args['onMessage-select']).toHaveBeenCalledTimes(PRIVATE_MESSAGES.length)
		await expect(within(getMessage(canvasElement, 'p6')).getByRole('checkbox', { name: 'Выбрать сообщение' })).toBeChecked()
		await expect(selectAll).toHaveAttribute('aria-disabled', 'true')
		await expect(selectAll).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await expect(within(toolbar).getByText(`Выбрано: ${PRIVATE_MESSAGES.length}`)).toBeInTheDocument()
		await expect(args['onMessage-select']).toHaveBeenCalledTimes(PRIVATE_MESSAGES.length)

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(canvas.queryByRole('group', { name: 'Действия с выбранными сообщениями' })).not.toBeInTheDocument())
		await waitFor(() => expect(field).toHaveFocus())
		await expect(canvas.queryByRole('checkbox', { name: 'Выбрать сообщение' })).not.toBeInTheDocument()
	},
}
