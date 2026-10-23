import { expect } from 'storybook/test'
import type meta from '../../BaseChart.stories'
import BaseChart from '../../../ui/BaseChart.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'
import { DENSE_LABELS, DENSE_SCRIPT, DENSE_SERIES } from '../../shared'

const template = `<BaseChart v-bind="args" :labels="labels" :series="series" />`

export const Dense: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Тысяча точек на ряд: подписи оси X прореживаются по ширине контейнера, подсказка ищет ближайшую точку.',
					'Стрелки идут по одной точке, PageUp и PageDown — шагом в десятую часть ряда (здесь 100 точек).',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseChart'], script: DENSE_SCRIPT }),
		},
	},
	args: { label: 'Нагрузка на сервер за 1000 дней', labelsTitle: 'День' },
	render: args => ({
		components: { BaseChart },
		setup: useStorySetup(args, { data: { labels: DENSE_LABELS, series: DENSE_SERIES } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await tabTo(canvas.getByRole('img'), userEvent)
		await userEvent.keyboard('{PageDown}')
		await expect(canvas.getByRole('status')).toHaveTextContent(/^101: /)
		await userEvent.keyboard('{PageDown}{PageUp}')
		await expect(canvas.getByRole('status')).toHaveTextContent(/^101: /)
	},
}
