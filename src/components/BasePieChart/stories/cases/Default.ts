import { expect } from 'storybook/test'
import type meta from '../BasePieChart.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Задачи по статусам: в центре — всего задач, при наведении — выбранная часть.' } } },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('figure', { name: 'задач' })).toBeInTheDocument()
		await expect(canvas.getAllByRole('listitem')).toHaveLength(4)
		await expect(canvas.getByText('44%')).toBeInTheDocument()
		await expect(canvas.getByText('9,4%')).toBeInTheDocument()
	},
}
