import { expect } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Пустая карта: нет узлов — на холсте текст «На карте пока нет узлов» (слот `empty` заменяет его), мини-карта и легенда скрыты.',
			},
		},
	},
	args: { data: { version: 1, notation: 'services', title: 'Новая карта', nodes: [], edges: [] } },
	play: async ({ canvas }) => {
		await expect(canvas.getByText('На карте пока нет узлов')).toBeVisible()
		await expect(canvas.queryByRole('application', { name: 'Мини-карта' })).toBeNull()
		await expect(canvas.queryByRole('group', { name: 'Обозначения' })).toBeNull()
	},
}
