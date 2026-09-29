import { expect } from 'storybook/test'
import { BASIC_ITEMS } from '../../shared'
import type meta from '../../BaseSideBar.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const ActiveByKey: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Текущий пункт по ключу (`activeKey`) — когда активный раздел не связан с адресом страницы.' } },
	},
	args: { items: BASIC_ITEMS, activePath: undefined, activeKey: 'calendar' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link', { name: 'Календарь' })).toHaveAttribute('aria-current', 'page')
	},
}
