import { expect } from 'storybook/test'
import { TEAM_SERIES } from '../../shared'
import type meta from '../../BaseChart.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const MultiSeries: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Восемь рядов — все цвета палитры `--rise-chart-1…8`. Цвет закреплён за порядком ряда и не меняется, когда соседние скрыты.',
			},
		},
	},
	args: {
		label: 'Сотрудники по городам за полугодие',
		labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
		series: TEAM_SERIES,
		labelsTitle: 'Месяц',
	},
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('button', { pressed: true })).toHaveLength(8)
	},
}
