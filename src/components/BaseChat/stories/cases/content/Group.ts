import type meta from '../../BaseChat.stories'
import { expect, within } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { GROUP_CHAT, GROUP_MESSAGES, COMMANDS, IVAN } from '../../shared'

export const Group: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Групповой чат (`isGroup`): у чужих сообщений — аватар и имя. Имя и аватар открывают профиль отправителя в панели',
					'«Информация» и эмитят `avatar-click` с `senderId`. @упоминания и /команды в тексте — кнопки.',
				].join('\n'),
			},
		},
	},
	args: { ...GROUP_CHAT, messages: GROUP_MESSAGES, commands: COMMANDS },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: IVAN.name }))
		await expect(args['onAvatar-click']).toHaveBeenCalledWith('u2')
		const profile = await canvas.findByRole('dialog', { name: 'Профиль' })
		await expect(within(profile).getByText(IVAN.name)).toBeInTheDocument()
	},
}
