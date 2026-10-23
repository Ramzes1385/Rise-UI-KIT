import { tabTo } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDropdownMenu.stories'
import { screen, waitFor, expect, within } from 'storybook/test'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: буква переводит фокус на пункт с этой буквы (повтор — на следующий), Home и End — на первый',
					'и последний пункт, Tab не уводит фокус из меню, Escape закрывает меню.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Действия' })
		await tabTo(trigger, userEvent)
		await userEvent.keyboard('{ArrowDown}')
		const menu = await screen.findByRole('menu', { name: 'Действия' })
		await waitFor(() => expect(within(menu).getByRole('menuitem', { name: /Переименовать/ })).toHaveFocus())

		await userEvent.keyboard('з')
		await expect(within(menu).getByRole('menuitem', { name: /Закрепить/ })).toHaveFocus()
		await userEvent.keyboard('{End}')
		await expect(within(menu).getByRole('menuitem', { name: /Удалить серию/ })).toHaveFocus()
		await userEvent.keyboard('{Home}')
		await expect(within(menu).getByRole('menuitem', { name: /Переименовать/ })).toHaveFocus()
		await userEvent.keyboard('{ArrowUp}')
		await expect(within(menu).getByRole('menuitem', { name: /Удалить серию/ })).toHaveFocus()

		await userEvent.tab()
		await expect(within(menu).getByRole('menuitem', { name: /Удалить серию/ })).toHaveFocus()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}
