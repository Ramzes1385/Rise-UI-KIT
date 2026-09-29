import { expect } from 'storybook/test'
import type meta from '../../BaseMegaMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import type { MegaMenuItem } from '../../../types/BaseMegaMenu.types'

const DISABLED_ITEMS: MegaMenuItem[] = [
	{
		label: 'Продукты',
		icon: 'folder',
		children: [
			{ label: 'Аналитика', icon: 'star', to: '/analytics' },
			{ label: 'Прогнозы (скоро)', icon: 'calendar', isDisabled: true },
			{ label: 'Документы', icon: 'file', to: '/docs' },
		],
	},
	{ label: 'Маркетплейс', isDisabled: true },
	{ label: 'Контакты', to: '/contacts' },
]

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Отключённые пункты приглушены и помечены `aria-disabled`: не раскрываются и не выполняют переход.' },
		},
	},
	args: { layout: 'dropdown', items: DISABLED_ITEMS },
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('button', { name: 'Маркетплейс' })).toBeDisabled()
		await userEvent.click(canvas.getByRole('button', { name: 'Продукты' }))
		await expect(canvas.getByRole('button', { name: 'Прогнозы (скоро)' })).toHaveAttribute('aria-disabled', 'true')
	},
}
