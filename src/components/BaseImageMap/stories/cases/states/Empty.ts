import { expect } from 'storybook/test'
import type meta from '../../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'В данных нет слоёв (`layers: []`): вместо карты — «Нет слоёв карты», кнопки масштаба остаются.' } },
	},
	args: { data: { version: 1, layers: [], objects: [] } },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('region', { name: 'Интерактивная карта' })).toHaveTextContent('Нет слоёв карты')
		await expect(canvas.queryByRole('button', { name: /Вершина/ })).not.toBeInTheDocument()
	},
}
