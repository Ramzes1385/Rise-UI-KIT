import type meta from '../BaseDropdownMenu.stories'
import { docsFrame, tabTo } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor, within } from 'storybook/test'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			...docsFrame(320),
			description: {
				story: [
					'Песочница: меню действий с серией. Enter на кнопке открывает меню на первом пункте, стрелки ходят по пунктам,',
					'Escape закрывает меню и возвращает фокус на кнопку, выбор пункта — тоже.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent, args }) => {
		const trigger = canvas.getByRole('button', { name: 'Действия' })
		await expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
		await tabTo(trigger, userEvent)

		await userEvent.keyboard('{Enter}')
		const menu = await screen.findByRole('menu', { name: 'Действия' })
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')
		await waitFor(() => expect(within(menu).getByRole('menuitem', { name: /Переименовать/ })).toHaveFocus())
		await expect(within(menu).getAllByRole('separator')).toHaveLength(2)

		await userEvent.keyboard('{ArrowDown}')
		await expect(within(menu).getByRole('menuitem', { name: /Дублировать/ })).toHaveFocus()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()

		await userEvent.keyboard('{ArrowUp}')
		await waitFor(() => expect(screen.getByRole('menuitem', { name: /Удалить серию/ })).toHaveFocus())
		await userEvent.keyboard('{Enter}')
		await expect(args.onSelect).toHaveBeenCalledWith(expect.objectContaining({ label: 'Удалить серию' }), expect.anything())
		await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}
