import { expect } from 'storybook/test'
import type meta from '../../BaseChart.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Нет рядов или подписей — «Нет данных» (или слот `empty`) на высоту графика; ни области, ни легенды, ни таблицы.',
			},
		},
	},
	args: { series: [], labels: [] },
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Нет данных')).toBeVisible()
		await expect(canvas.queryByRole('img')).not.toBeInTheDocument()
		await expect(canvas.queryByRole('table')).not.toBeInTheDocument()
	},
}
