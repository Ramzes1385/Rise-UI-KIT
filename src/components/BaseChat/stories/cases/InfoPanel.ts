import type meta from '../BaseChat.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, within, waitFor } from 'storybook/test'
import { GROUP_CHAT, GROUP_MESSAGES, IVAN } from '../shared'

export const InfoPanel: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Панель «Информация» — `BaseSlideover` внутри окна: сводка чата с описанием (`description`), вкладки (стрелки',
					'переключают), участники. Администратор меняет роль, исключает и банит участника из меню. Escape закрывает панель',
					'и возвращает фокус на кнопку «Информация о чате».',
				].join('\n'),
			},
		},
	},
	args: { ...GROUP_CHAT, messages: GROUP_MESSAGES, currentUserRole: 'admin' },
	play: async ({ canvas, userEvent, args }) => {
		const infoButton = canvas.getByRole('button', { name: 'Информация о чате' })
		await userEvent.click(infoButton)
		const panel = await canvas.findByRole('dialog', { name: 'Информация' })
		await expect(within(panel).getByText(GROUP_CHAT.description)).toBeInTheDocument()
		const membersTab = within(panel).getByRole('tab', { name: 'Участники' })
		await waitFor(() => expect(membersTab).toHaveFocus())

		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(within(panel).getByRole('tab', { name: 'Медиа' })).toHaveAttribute('aria-selected', 'true'))
		await userEvent.keyboard('{ArrowLeft}')

		await userEvent.click(within(panel).getByRole('button', { name: `Действия с участником ${IVAN.name}` }))
		await userEvent.click(within(panel).getByRole('menuitem', { name: 'Сделать админом' }))
		await expect(args['onUpdate-member-role']).toHaveBeenCalledWith({ memberId: 'u2', role: 'admin' })

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(canvas.queryByRole('dialog', { name: 'Информация' })).not.toBeInTheDocument())
		await expect(infoButton).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await expect(await canvas.findByRole('dialog', { name: 'Информация' })).toBeInTheDocument()
	},
}
