import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseChart.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { SENSOR_LABELS, SENSOR_SERIES } from '../../shared'

export const WithGaps: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Пропуски: `null` в ряду рвёт линию, одиночное значение между пропусками рисуется точкой; в подсказке и таблице — «нет значения».',
			},
		},
	},
	args: {
		label: 'Температура в цехах, °C',
		labels: SENSOR_LABELS,
		series: SENSOR_SERIES,
		labelsTitle: 'Время',
		valueFormat: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
	},
	play: async ({ canvas, userEvent }) => {
		await tabTo(canvas.getByRole('img'), userEvent)
		await userEvent.keyboard('{ArrowRight}{ArrowRight}')
		await expect(canvas.getByRole('status')).toHaveTextContent('03:00: Цех 1: 18,1, Цех 2: нет значения')
	},
}
