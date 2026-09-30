import { expect } from 'storybook/test'
import type meta from '../../BaseProgress.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseProgress from '../../../ui/BaseProgress.vue'
import { PROGRESS_FILLS } from '../../../types/BaseProgress.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const fills = PROGRESS_FILLS

const template = `
	<div class="story-stack">
		<div v-for="fill in fills" :key="fill" class="story-row" style="flex-wrap: nowrap;">
			<span class="story-label">{{ fill }}</span>
			<BaseProgress v-bind="args" :fill="fill" :aria-label="fill" />
			<BaseProgress v-bind="args" :fill="fill" shape="circle" :has-label="true" :aria-label="fill" />
		</div>
	</div>
`

export const Fills: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['value', 'animation', 'sizeScale', 'color'] },
		docs: {
			description: {
				story: [
					'Заливка `fill`: `gradient` — от светлого оттенка к цвету; `rainbow` — радуга на всю шкалу, заливка открывает её по мере роста;',
					'`segments` — полоса из делений (у кольца — сплошная). Радуга собрана из токенов `--rise-chart-*`.',
					'С `animation="flow"` перелив бежит вдоль полосы — попробуйте в Controls.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseProgress'],
				script: `const fills = ${literal(fills)}`,
				omit: ['default', 'fill', 'shape', 'hasLabel'],
			}),
		},
	},
	args: { value: 70 },
	render: args => ({
		components: { BaseProgress },
		setup: useStorySetup(args, { data: { fills }, slots: ['default', 'fill', 'shape', 'hasLabel'] }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getAllByRole('progressbar', { name: 'rainbow' })).toHaveLength(2)
		await expect(canvasElement.querySelectorAll('.base-progress--fill-rainbow')).toHaveLength(2)
		const stroke = canvasElement.querySelector<SVGCircleElement>('.base-progress--fill-rainbow .base-progress__fill-circle')
		await expect(stroke?.style.stroke).toMatch(/^url\("?#base-progress-/)
	},
}
