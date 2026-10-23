import { within, expect } from 'storybook/test'
import type meta from '../../../BaseChat.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { GROUP_CHAT, GROUP_MESSAGES, COMMANDS, MARIA } from '../../../shared'

export const MentionsAndCommands: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Подсказки: «@» открывает список участников, «/» — список команд (или кнопка «</>» слева). Список связан с полем',
					'(`aria-activedescendant`), стрелки выбирают пункт, Escape закрывает. Enter подставляет выбранное и сообщение не',
					'отправляет: отправка — следующим Enter (история Mention Enter).',
				].join('\n'),
			},
		},
	},
	args: { ...GROUP_CHAT, messages: GROUP_MESSAGES.slice(0, 3), commands: COMMANDS, quickReplies: [] },
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('textbox', { name: 'Сообщение' })
		await userEvent.type(field, '@Ма')
		const mentions = await canvas.findByRole('listbox', { name: 'Участники для упоминания' })
		const maria = within(mentions).getByRole('option', { name: new RegExp(MARIA.name) })
		await expect(field).toHaveAttribute('aria-activedescendant', maria.id)
		await userEvent.keyboard('{Escape}')
		await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument()

		await userEvent.clear(field)
		await userEvent.type(field, '/')
		const commands = await canvas.findByRole('listbox', { name: 'Команды чата' })
		await userEvent.keyboard('{ArrowDown}')
		await expect(within(commands).getByRole('option', { name: /\/status/ })).toHaveAttribute('aria-selected', 'true')
		await userEvent.keyboard('{Enter}')
		await expect(field).toHaveValue('/status ')
		await expect(args.onSend).not.toHaveBeenCalled()
		await userEvent.keyboard('{Enter}')
		await expect(args.onSend).toHaveBeenCalledWith(expect.objectContaining({ text: '/status' }))
	},
}
