import { expect } from 'storybook/test'
import type meta from '../BaseSideBar.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Collapsed: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Свёрнутая панель: у пунктов остаются иконки, подсказка с названием и доступное имя; вложенные уровни и тело скрыты,',
					'подвал сохраняется. Подсказка появляется при наведении на пункт.',
				].join('\n'),
			},
		},
	},
	args: { isCollapsed: true, activePath: '/dashboard' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('complementary')).toHaveClass('base-side-bar--collapsed')
		await expect(canvas.getByRole('link', { name: 'Главная' })).toHaveAttribute('aria-current', 'page')
		await expect(canvas.getByRole('button', { name: 'Развернуть' })).toBeVisible()
	},
}
