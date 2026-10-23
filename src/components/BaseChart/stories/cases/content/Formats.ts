import { expect } from 'storybook/test'
import type meta from '../../BaseChart.stories'
import BaseChart from '../../../ui/BaseChart.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SALES_DAYS, SALES_SERIES } from '../../shared'
import { literal, storySource, tabTo, useStorySetup } from '@/stories/helpers'

const template = `<BaseChart v-bind="args" :labels="labels" :series="series" />`

export const Formats: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Форматы через `Intl` языка кита: значения — `valueFormat` (рубли без копеек), подписи-даты — `labelFormat` (день недели и число).',
					'Переключатель «Язык» на панели меняет формат дат и чисел. Свои функции — `formatValue` и `formatLabel`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseChart'],
				script: [`const labels = ${literal(SALES_DAYS)}`, `const series = ${literal(SALES_SERIES)}`].join('\n'),
			}),
		},
	},
	args: {
		variant: 'bar',
		label: 'Продажи за две недели',
		labelsTitle: 'Дата',
		valueFormat: { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 },
		labelFormat: { weekday: 'short', day: 'numeric' },
		hasLegend: false,
	},
	render: args => ({
		components: { BaseChart },
		setup: useStorySetup(args, { data: { labels: SALES_DAYS, series: SALES_SERIES } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await tabTo(canvas.getByRole('img'), userEvent)
		await userEvent.keyboard('{End}')
		await expect(canvas.getByRole('status')).toHaveTextContent(/^чт, 15: Продажи: 39\s800\s₽$/)
	},
}
