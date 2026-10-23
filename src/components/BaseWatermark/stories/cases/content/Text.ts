import { expect } from 'storybook/test'
import type meta from '../../BaseWatermark.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseWatermark from '../../../ui/BaseWatermark.vue'
import { watermarkLayer, waitForPattern } from '../../shared'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseWatermark v-bind="args">
		<div class="story-frame story-medium story-stack">
			<strong>Квартальный отчёт</strong>
			<span>Выручка выросла на 12 %, расходы на поддержку сократились. Подробности — в приложении.</span>
		</div>
	</BaseWatermark>
`

export const Text: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Одна строка: `content="Черновик"`. Размер шрифта — `fontSize`, цвет — `textColor` (цвет CSS, без `var()`).',
					'Серый по умолчанию читается на светлой и тёмной теме и не заслоняет текст под знаком.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseWatermark'] }),
		},
	},
	args: { content: 'Черновик', fontSize: 24 },
	render: args => ({
		components: { BaseWatermark },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		await waitForPattern(watermarkLayer(canvasElement))
		await expect(canvas.getByText('Квартальный отчёт')).toBeVisible()
	},
}
