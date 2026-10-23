import { expect } from 'storybook/test'
import type meta from '../../BaseWatermark.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseWatermark from '../../../ui/BaseWatermark.vue'
import { watermarkLayer, waitForPattern } from '../../shared'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseWatermark v-bind="args">
		<div class="story-frame story-medium story-stack">
			<strong>Выписка по счёту</strong>
			<span>Остаток на 13 октября: 128 450 ₽. Последнее списание — оплата связи, 790 ₽.</span>
		</div>
	</BaseWatermark>
`

export const MultiLine: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`content` массивом — несколько строк в одном знаке: имя получателя и дата просмотра. По ним видно, чья копия документа',
					'ушла наружу.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseWatermark'] }),
		},
	},
	args: { content: ['Анна Смирнова', '13.10.2026'] },
	render: args => ({
		components: { BaseWatermark },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		await waitForPattern(watermarkLayer(canvasElement))
		await expect(canvas.getByText('Выписка по счёту')).toBeVisible()
	},
}
