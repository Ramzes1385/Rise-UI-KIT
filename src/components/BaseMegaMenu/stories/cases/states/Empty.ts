import { expect } from 'storybook/test'
import type meta from '../../BaseMegaMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Без разделов: пустая строка сохраняет высоту, панель не открывается.' } } },
	args: { items: [], openKey: undefined },
	play: async ({ canvas }) => {
		await expect(canvas.queryAllByRole('listitem')).toHaveLength(0)
		await expect(canvas.getByRole('navigation', { name: 'Главное меню' })).toBeVisible()
	},
}
