import { expect } from 'storybook/test'
import type meta from '../BasePagination.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Нет данных (`total` = 0): номеров нет, обе стрелки заблокированы.' } } },
	args: { total: 0 },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Предыдущая страница' })).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Следующая страница' })).toBeDisabled()
		await expect(canvas.queryByRole('button', { current: 'page' })).toBeNull()
	},
}
