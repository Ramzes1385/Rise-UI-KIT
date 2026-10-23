import { expect } from 'storybook/test'
import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Пустой роадмап (`stages: []`): заголовок остаётся, вместо пути — «В пути пока нет этапов». Сводка и переключатели скрыты.',
					'Свою заглушку, например кнопку «Добавить этап», задаёт слот `empty`.',
				].join('\n'),
			},
		},
	},
	args: { data: { version: 1, title: 'Новый путь', stages: [] }, progress: { version: 1, topics: {} }, expanded: [], selected: null },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('heading', { level: 2, name: 'Новый путь' })).toBeVisible()
		await expect(canvas.getByText('В пути пока нет этапов')).toBeVisible()
		await expect(canvas.queryByRole('radiogroup')).toBeNull()
	},
}
