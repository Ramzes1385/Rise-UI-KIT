import { expect } from 'storybook/test'
import type meta from '../../BaseChart.stories'
import BaseChart from '../../../ui/BaseChart.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { CHANNEL_SERIES, QUARTERS } from '../../shared'
import { storySource, useStorySetup } from '@/stories/helpers'

const MODELS = { hidden: 'hiddenSeries' } as const
const template = `<BaseChart v-bind="args" v-model:hidden-series="hidden" />`

export const HiddenSeries: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Скрытые ряды через `v-model:hidden-series`: кнопки легенды — переключатели с `aria-pressed`, имена скрытых рядов видны в Controls.',
					'Скрытый ряд не входит в шкалу и сводку, но остаётся в таблице для скринридера; цвета остальных рядов не меняются.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseChart'], models: MODELS }),
		},
	},
	args: {
		label: 'Заказы по каналам за 2026 год',
		labels: QUARTERS,
		series: CHANNEL_SERIES,
		labelsTitle: 'Квартал',
		hiddenSeries: ['Партнёры'],
	},
	render: args => ({ components: { BaseChart }, setup: useStorySetup(args, { models: MODELS }), template }),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(canvas.getByRole('button', { name: 'Партнёры' })).toHaveAttribute('aria-pressed', 'false')
		await expect(canvasElement.querySelectorAll('.base-chart__line')).toHaveLength(2)
		const app = canvas.getByRole('button', { name: 'Приложение' })
		await userEvent.click(app)
		await expect(app).toHaveAttribute('aria-pressed', 'false')
		await expect(canvasElement.querySelectorAll('.base-chart__line')).toHaveLength(1)
		await expect(canvas.getByRole('img')).toHaveAccessibleName(/^Заказы по каналам за 2026 год: Сайт; /)
		await userEvent.click(app)
		await expect(app).toHaveAttribute('aria-pressed', 'true')
	},
}
