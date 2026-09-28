import { expect } from 'storybook/test'
import type meta from '../BaseSideBar.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Loading: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Загрузка: вместо навигации, тела и подвала — скелетон.' } } },
	args: { isLoading: true },
	play: async ({ canvas }) => {
		await expect(canvas.queryByRole('link')).toBeNull()
		await expect(canvas.getByRole('heading', { name: 'Панель управления' })).toBeVisible()
	},
}
