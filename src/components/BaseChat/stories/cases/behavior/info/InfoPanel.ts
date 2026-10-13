import type meta from '../../../BaseChat.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, within, waitFor } from 'storybook/test'
import { GROUP_CHAT, GROUP_MESSAGES, IVAN, MARIA } from '../../../shared'

export const InfoPanel: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Панель «Информация» — `BaseSlideover` внутри окна: сводка чата с описанием (`description`), вкладки (стрелки',
					'переключают), участники. Администратор меняет роль, исключает и банит участника из меню — исключение и бан',
					'сначала спрашивают подтверждение в диалоге, а `add-member` приходит по кнопке «Добавить участника» (выбор человека — на',
					'стороне приложения). Escape закрывает панель и возвращает фокус на кнопку «Информация о чате».',
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
		await userEvent.click(await screen.findByRole('menuitem', { name: 'Сделать админом' }))
		await expect(args['onUpdate-member-role']).toHaveBeenCalledWith({ memberId: 'u2', role: 'admin' })

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(canvas.queryByRole('dialog', { name: 'Информация' })).not.toBeInTheDocument())
		await expect(infoButton).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		const reopened = await canvas.findByRole('dialog', { name: 'Информация' })

		await userEvent.click(within(reopened).getByRole('button', { name: `Действия с участником ${IVAN.name}` }))
		await userEvent.click(await screen.findByRole('menuitem', { name: 'Исключить' }))
		const kickDialog = await canvas.findByRole('dialog', { name: 'Исключить' })
		await expect(args['onKick-member']).not.toHaveBeenCalled()
		await userEvent.click(within(kickDialog).getByRole('button', { name: 'Подтвердить' }))
		await expect(args['onKick-member']).toHaveBeenCalledWith('u2')
		await waitFor(() => expect(canvas.queryByRole('dialog', { name: 'Исключить' })).not.toBeInTheDocument())

		await userEvent.click(within(reopened).getByRole('button', { name: `Действия с участником ${MARIA.name}` }))
		await userEvent.click(await screen.findByRole('menuitem', { name: 'Забанить' }))
		const cancelDialog = await canvas.findByRole('dialog', { name: 'Забанить' })
		await userEvent.click(within(cancelDialog).getByRole('button', { name: 'Отмена' }))
		await waitFor(() => expect(canvas.queryByRole('dialog', { name: 'Забанить' })).not.toBeInTheDocument())
		await expect(args['onBan-member']).not.toHaveBeenCalled()

		await userEvent.click(within(reopened).getByRole('button', { name: `Действия с участником ${MARIA.name}` }))
		await userEvent.click(await screen.findByRole('menuitem', { name: 'Забанить' }))
		const banDialog = await canvas.findByRole('dialog', { name: 'Забанить' })
		await userEvent.click(within(banDialog).getByRole('button', { name: 'Подтвердить' }))
		await expect(args['onBan-member']).toHaveBeenCalledWith({ memberId: 'u3' })

		const trigger = within(reopened).getByRole('button', { name: `Действия с участником ${IVAN.name}` })
		trigger.focus()
		await userEvent.keyboard('{ArrowDown}')
		const keyboardMenu = await screen.findByRole('menu', { name: `Действия с участником ${IVAN.name}` })
		const keyboardItems = within(keyboardMenu).getAllByRole('menuitem')
		await waitFor(() => expect(keyboardItems[0]).toHaveFocus())
		await userEvent.keyboard('{ArrowDown}')
		await expect(keyboardItems[1]).toHaveFocus()
		await userEvent.keyboard('{End}')
		await expect(keyboardItems[keyboardItems.length - 1]).toHaveFocus()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()

		await userEvent.click(within(reopened).getByRole('button', { name: 'Добавить участника' }))
		await expect(args['onAdd-member']).toHaveBeenCalledTimes(1)
	},
}
