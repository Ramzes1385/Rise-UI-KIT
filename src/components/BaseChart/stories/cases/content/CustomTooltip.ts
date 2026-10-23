import { expect } from 'storybook/test'
import type meta from '../../BaseChart.stories'
import BaseChart from '../../../ui/BaseChart.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseChart v-bind="args">
		<template #tooltip="{ point }">
			<strong>{{ point.label }}</strong>
			<span v-for="value in point.values" :key="value.name">{{ value.name }} — {{ value.text }} тыс. ₽</span>
		</template>
	</BaseChart>
`

export const CustomTooltip: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Слот `tooltip` заменяет содержимое подсказки: в `point` — подпись, индекс и значения видимых рядов с цветом и готовым текстом.',
			},
			source: storySource({ template, imports: ['BaseChart'] }),
		},
	},
	args: { variant: 'area' },
	render: args => ({ components: { BaseChart }, setup: useStorySetup(args), template }),
	play: async ({ canvas, userEvent }) => {
		await tabTo(canvas.getByRole('img'), userEvent)
		await userEvent.keyboard('{ArrowLeft}')
		await expect(canvas.getByText('Выручка — 240 тыс. ₽')).toBeVisible()
		await expect(canvas.getByText('Расходы — 162 тыс. ₽')).toBeVisible()
	},
}
