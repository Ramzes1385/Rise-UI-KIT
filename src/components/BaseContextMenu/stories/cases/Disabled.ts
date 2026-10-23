import { tabTo } from '@/stories/helpers'
import { expect, screen } from 'storybook/test'
import type meta from '../BaseContextMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Отключённое меню (`isDisabled`): правый клик открывает меню браузера, своё меню не появляется.' } },
	},
	args: { isDisabled: true },
	play: async ({ canvas, userEvent }) => {
		const area = canvas.getByRole('group', { name: /Серия 3/ })
		await tabTo(area, userEvent)
		await userEvent.keyboard('{Shift>}{F10}{/Shift}')
		await expect(screen.queryByRole('menu')).not.toBeInTheDocument()
	},
}
