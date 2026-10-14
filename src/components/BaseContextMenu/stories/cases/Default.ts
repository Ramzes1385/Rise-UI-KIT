import { docsFrame } from '@/stories/helpers'
import type meta from '../BaseContextMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, expect, within, waitFor } from 'storybook/test'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			...docsFrame(300),
			description: { story: 'Песочница: правый клик по карточке открывает меню у указателя; выбор пункта закрывает меню.' },
		},
	},
	play: async ({ canvas, userEvent, args }) => {
		const card = canvas.getByText('Серия 3 · «Туман над заливом»')
		await userEvent.pointer({ keys: '[MouseRight]', target: card })
		const menu = await screen.findByRole('menu', { name: 'Контекстное меню' })
		await expect(menu).toHaveFocus()

		await userEvent.keyboard('{ArrowDown}')
		await expect(within(menu).getByRole('menuitem', { name: /Открыть/ })).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await expect(args.onSelect).toHaveBeenCalledWith(expect.objectContaining({ label: 'Открыть' }), expect.anything())
		await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
	},
}
