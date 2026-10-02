import { BALANCE_SERIES } from '../../shared'
import type meta from '../../BaseChart.stories'
import BaseChart from '../../../ui/BaseChart.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<BaseChart v-bind="args" variant="bar" />
		<BaseChart v-bind="args" variant="area" />
	</div>
`

export const Stacked: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Стопка (`isStacked`) у столбиков и областей: положительные значения копятся вверх от нуля, отрицательные («Возвраты») — вниз.',
			},
			source: storySource({ template, imports: ['BaseChart'] }),
		},
		controls: { exclude: ['variant'] },
	},
	args: {
		label: 'Поступления за полугодие, тыс. ₽',
		labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
		series: BALANCE_SERIES,
		isStacked: true,
	},
	render: args => ({ components: { BaseChart }, setup: useStorySetup(args), template }),
}
