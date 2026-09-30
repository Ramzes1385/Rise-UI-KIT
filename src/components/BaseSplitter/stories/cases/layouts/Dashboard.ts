import { expect } from 'storybook/test'
import type meta from '../../BaseSplitter.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSplitter from '../../../ui/BaseSplitter.vue'
import { literal, staticStorySource, useStorySetup } from '@/stories/helpers'

const widgets = [
	{ slot: 'pane-1', title: 'Выручка', value: '4,2 млн ₽' },
	{ slot: 'pane-2', title: 'Заказы', value: '1 048' },
	{ slot: 'pane-3', title: 'Средний чек', value: '4 010 ₽' },
]

const state = { rowSize: 55, topSize: 65, bottomSizes: [34, 33, 33] }

const template = `
	<div style="height: 400px; border: 1px solid var(--rise-border); border-radius: 8px; overflow: hidden">
		<BaseSplitter v-model="rowSize" orientation="vertical" label="Верхний ряд">
			<template #start>
				<BaseSplitter v-model="topSize" label="График продаж">
					<template #start>
						<section style="padding: 12px 16px">
							<h3 style="margin-top: 0">Продажи за неделю</h3>
							<p style="margin: 0">Пн — 520 тыс. ₽, вт — 610 тыс. ₽, ср — 580 тыс. ₽</p>
						</section>
					</template>
					<template #end>
						<section style="padding: 12px 16px">
							<h3 style="margin-top: 0">План</h3>
							<p style="margin: 0">Выполнен на 84%</p>
						</section>
					</template>
				</BaseSplitter>
			</template>
			<template #end>
				<BaseSplitter v-model:sizes="bottomSizes" :min="20" :pane-labels="['Выручка', 'Заказы']">
					<template v-for="widget in widgets" :key="widget.slot" #[widget.slot]>
						<section style="padding: 12px 16px">
							<h3 style="margin-top: 0">{{ widget.title }}</h3>
							<p style="margin: 0">{{ widget.value }}</p>
						</section>
					</template>
				</BaseSplitter>
			</template>
		</BaseSplitter>
	</div>
`

export const Dashboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Дашборд: два ряда одной над другой, в верхнем — две панели, в нижнем — три виджета.',
					'Слоты `pane-N` можно выдать в цикле по данным: `#[widget.slot]`.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseSplitter'],
				state,
				types: { bottomSizes: 'number[]' },
				script: `const widgets = ${literal(widgets)}`,
			}),
		},
		controls: { disable: true },
	},
	render: args => ({
		components: { BaseSplitter },
		setup: useStorySetup(args, { state, data: { widgets } }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('separator')).toHaveLength(4)
		await expect(canvas.getByRole('separator', { name: 'Верхний ряд' })).toHaveAttribute('aria-orientation', 'horizontal')
		await expect(canvas.getByRole('separator', { name: 'Заказы' })).toHaveAttribute('aria-valuenow', '33')
		await expect(canvas.getByRole('heading', { name: 'Средний чек' })).toBeVisible()
	},
}
