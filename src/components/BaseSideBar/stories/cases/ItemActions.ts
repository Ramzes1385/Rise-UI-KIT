import { expect } from 'storybook/test'
import type meta from '../BaseSideBar.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import type { SideBarItem } from '../../types/BaseSideBar.types'

const ACTION_ITEMS: SideBarItem[] = [
	{ key: 'new-report', label: 'Создать отчёт', icon: 'plus' },
	{ key: 'export', label: 'Выгрузить данные', icon: 'download', badge: 'новое' },
	{ key: 'archive', label: 'Архивировать', icon: 'folder', isDisabled: true },
]

export const ItemActions: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Пункты без `to` — кнопки-действия: клик вызывает `item.click` и событие `itemClick`, отключённый пункт не реагирует.',
			},
		},
	},
	args: { items: ACTION_ITEMS, activePath: undefined },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Создать отчёт' }))
		await expect(args.onItemClick).toHaveBeenCalledWith(ACTION_ITEMS[0], expect.anything())
		await expect(canvas.getByRole('button', { name: 'Архивировать' })).toBeDisabled()
	},
}
