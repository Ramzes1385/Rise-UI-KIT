import type meta from '../../../BaseChat.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { within, expect, waitFor } from 'storybook/test'
import { GROUP_CHAT, GROUP_MESSAGES, COMMANDS, MARIA } from '../../../shared'

export const MentionEnter: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Enter в открытой подсказке выбирает пункт и сообщение не отправляет — как в списке combobox. Подсказка закрывается,',
					'в поле остаётся «@Имя » или «/команда », и только следующий Enter при закрытом списке отправляет сообщение.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	args: { ...GROUP_CHAT, messages: GROUP_MESSAGES.slice(0, 3), commands: COMMANDS, quickReplies: [] },
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('textbox', { name: 'Сообщение' })
		await userEvent.type(field, '@Ма')
		const mentions = await canvas.findByRole('listbox', { name: 'Участники для упоминания' })
		await expect(within(mentions).getByRole('option', { name: new RegExp(MARIA.name) })).toHaveAttribute('aria-selected', 'true')
		await userEvent.keyboard('{Enter}')
		await expect(field).toHaveValue(`@${MARIA.name} `)
		await waitFor(() => expect(canvas.queryByRole('listbox')).not.toBeInTheDocument())
		await expect(args.onSend).not.toHaveBeenCalled()
		await userEvent.keyboard('{Enter}')
		await expect(args.onSend).toHaveBeenCalledTimes(1)
		await expect(args.onSend).toHaveBeenCalledWith(expect.objectContaining({ text: `@${MARIA.name}` }))

		await userEvent.type(field, '/ta')
		const commands = await canvas.findByRole('listbox', { name: 'Команды чата' })
		await userEvent.keyboard('{ArrowDown}')
		await expect(within(commands).getByRole('option', { name: /\/status/ })).toHaveAttribute('aria-selected', 'true')
		await userEvent.keyboard('{Enter}')
		await expect(field).toHaveValue('/status ')
		await waitFor(() => expect(canvas.queryByRole('listbox')).not.toBeInTheDocument())
		await expect(args.onSend).toHaveBeenCalledTimes(1)
		await userEvent.keyboard('{Enter}')
		await expect(args.onSend).toHaveBeenCalledTimes(2)
		await expect(args.onSend).toHaveBeenLastCalledWith(expect.objectContaining({ text: '/status' }))
	},
}
