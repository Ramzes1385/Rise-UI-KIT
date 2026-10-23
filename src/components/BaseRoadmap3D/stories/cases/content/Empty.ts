import { expect } from 'storybook/test'
import type meta from '../../BaseRoadmap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'В данных нет этапов: остров пуст, тур недоступен.' } } },
	args: { data: { version: 1, title: 'Пусто', stages: [] }, progress: { version: 1, topics: {} } },
	play: async ({ canvas }) => {
		await expect(await canvas.findByRole('region', { name: 'Пусто' })).toBeVisible()
		await expect(canvas.getByRole('button', { name: 'Запустить тур' })).toBeDisabled()
	},
}
