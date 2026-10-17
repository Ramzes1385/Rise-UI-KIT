import type meta from '../BaseContextMenu.stories'
import { tabTo, inlineKey } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, waitFor, expect, within } from 'storybook/test'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Shift+F10 (или клавиша «Меню») на карточке открывает меню у неё с фокусом на первом пункте.',
					'Стрелка вправо открывает подменю, Escape закрывает подменю, затем меню, и фокус возвращается на карточку.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const area = canvas.getByRole('group', { name: /Серия 3/ })
		await tabTo(area, userEvent)
		await userEvent.keyboard('{Shift>}{F10}{/Shift}')
		const menu = await screen.findByRole('menu', { name: 'Контекстное меню' })
		await waitFor(() => expect(within(menu).getByRole('menuitem', { name: /Открыть/ })).toHaveFocus())

		await userEvent.keyboard('{End}{ArrowUp}' + inlineKey('{ArrowRight}'))
		const submenu = await screen.findByRole('menu', { name: /Переместить/ })
		await waitFor(() => expect(within(submenu).getByRole('menuitem', { name: 'Сезон 1' })).toHaveFocus())

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('menu', { name: /Переместить/ })).not.toBeInTheDocument())
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
		await expect(area).toHaveFocus()
	},
}
