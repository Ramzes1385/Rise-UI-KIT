import { expect } from 'storybook/test'
import { GRID_STYLE } from '../../shared'
import type meta from '../../BaseStat.stories'
import BaseStat from '../../../ui/BaseStat.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { BaseSparkline } from '@components/BaseSparkline'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const STATS = [
	{
		label: 'Выручка',
		value: 4_820_000,
		valueFormat: { style: 'currency', currency: 'RUB', notation: 'compact', maximumFractionDigits: 2 },
		change: 0.12,
		isInverse: false,
		trend: [3.1, 3.4, 3.2, 3.8, 3.6, 4.0, 4.1, 3.9, 4.3, 4.5, 4.4, 4.82],
	},
	{
		label: 'Заказы',
		value: 1284,
		valueFormat: {},
		change: 0.08,
		isInverse: false,
		trend: [880, 910, 940, 1010, 990, 1050, 1080, 1120, 1150, 1190, 1230, 1284],
	},
	{
		label: 'Возвраты',
		value: 0.021,
		valueFormat: { style: 'percent', maximumFractionDigits: 1 },
		change: -0.004,
		isInverse: true,
		trend: [3.2, 3.0, 2.9, 3.1, 2.8, 2.7, 2.6, 2.5, 2.5, 2.3, 2.2, 2.1],
	},
]

const hidden = ['label', 'value', 'valueFormat', 'change', 'isInverse']

const template = `
	<div style="${GRID_STYLE}">
		<BaseStat
			v-for="stat in stats"
			:key="stat.label"
			v-bind="args"
			:label="stat.label"
			:value="stat.value"
			:value-format="stat.valueFormat"
			:change="stat.change"
			:is-inverse="stat.isInverse">
			<template #chart>
				<BaseSparkline :values="stat.trend" :label="stat.label + ' за 12 недель'" variant="area" :height="40" />
			</template>
		</BaseStat>
	</div>
`

export const WithSparkline: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Тренд за 12 недель в слоте `chart`: BaseSparkline растягивается по ширине карточки.' },
			source: storySource({
				template,
				imports: ['BaseSparkline', 'BaseStat'],
				script: `const stats = ${literal(STATS)}`,
				omit: hidden,
			}),
		},
		controls: { include: ['variant', 'changeLabel', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseStat, BaseSparkline },
		setup: useStorySetup(args, { data: { stats: STATS }, slots: hidden }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('img')).toHaveLength(3)
		await expect(canvas.getByRole('img', { name: /^Возвраты за 12 недель/ })).toBeInTheDocument()
	},
}
