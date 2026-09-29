import { expect } from 'storybook/test'
import type meta from '../../BaseSlider.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Без слайдов: пустая область без стрелок и навигации. Когда данных нет, покажите вместо слайдера пустое',
					'состояние (например, BaseEmpty).',
				].join('\n'),
			},
		},
	},
	args: { items: [], height: '240px' },
	play: async ({ canvas }) => {
		await expect(canvas.queryAllByRole('button')).toHaveLength(0)
	},
}
