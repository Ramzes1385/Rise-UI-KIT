import { tabTo } from '@/stories/helpers'
import type meta from '../../../BaseChat.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { GROUP_CHAT, GROUP_MESSAGES, IVAN, MARIA } from '../../../shared'

export const MemberProfile: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Профиль участника: клик по участнику в панели «Информация» открывает профиль с ролью и предупреждениями в виде «2 из 5».',
					'Предел берётся из `maxWarnings` чата (по умолчанию 3), а `members[].maxWarnings` задаёт свой предел для участника. «Написать',
					'сообщение» эмитит `write-message` с id участника; открыть личный чат приложение решает само. Старое событие `avatar-click`',
					'для этого действия устарело и в примере не подписано, поэтому предупреждение об устаревании не выводится.',
				].join('\n'),
			},
		},
	},
	args: {
		...GROUP_CHAT,
		members: GROUP_CHAT.members.map(member => (member.id === 'u3' ? { ...member, warningsCount: 2 } : member)),
		messages: GROUP_MESSAGES,
		currentUserRole: 'admin',
		maxWarnings: 5,
		'onAvatar-click': undefined,
	},
	play: async ({ canvas, userEvent, args }) => {
		await tabTo(canvas.getByRole('button', { name: 'Информация о чате' }), userEvent, 30)
		await userEvent.keyboard('{Enter}')
		const panel = await canvas.findByRole('dialog', { name: 'Информация' })

		await userEvent.click(within(panel).getByText(MARIA.name, { selector: '.base-chat-slideover__member-name' }))
		await expect(await within(panel).findByText('Предупреждения')).toBeInTheDocument()
		await expect(within(panel).getByText('2 из 5')).toBeInTheDocument()

		await userEvent.click(within(panel).getByRole('button', { name: 'Назад к списку' }))
		await userEvent.click(await within(panel).findByText(IVAN.name, { selector: '.base-chat-slideover__member-name' }))
		await expect(await within(panel).findByText('0 из 5')).toBeInTheDocument()

		await userEvent.click(within(panel).getByRole('button', { name: 'Назад к списку' }))
		await userEvent.click(await within(panel).findByText(MARIA.name, { selector: '.base-chat-slideover__member-name' }))
		const write = await within(panel).findByRole('button', { name: 'Написать сообщение' })
		write.focus()
		await expect(write).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(args['onWrite-message']).toHaveBeenCalledWith('u3'))
	},
}
