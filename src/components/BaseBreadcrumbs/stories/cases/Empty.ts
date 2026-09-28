import { within, expect } from 'storybook/test'
import type meta from '../BaseBreadcrumbs.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Без пунктов: ориентир навигации остаётся, список пустой.' } } },
	args: { items: [] },
	play: async ({ canvas }) => {
		const list = within(canvas.getByRole('navigation', { name: 'Хлебные крошки' })).getByRole('list')
		await expect(within(list).queryAllByRole('listitem')).toHaveLength(0)
	},
}
