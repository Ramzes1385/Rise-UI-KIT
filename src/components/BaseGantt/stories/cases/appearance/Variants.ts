import { expect } from 'storybook/test'
import type meta from '../../BaseGantt.stories'
import BaseGantt from '../../../ui/BaseGantt.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import { GANTT_VARIANTS } from '../../../types/BaseGantt.types'

const template = `
	<div class="story-stack">
		<div v-for="variant in GANTT_VARIANTS" :key="variant">
			<span class="story-label">{{ variant }}</span>
			<BaseGantt v-bind="args" :variant="variant" :height="300" />
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['scale', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Три варианта полос: `default` — светлая полоса с сплошной заливкой прогресса, `soft` — бледная полоса с мягкой заливкой,',
					'`outline` — полоса без фона с рамкой цвета и прозрачной заливкой прогресса. Цвет задают токен `--rise-gantt-bar-bg` и проп `color`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseGantt', 'GANTT_VARIANTS'] }),
		},
	},
	render: args => ({
		components: { BaseGantt },
		setup: useStorySetup(args, { data: { GANTT_VARIANTS } }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getAllByRole('treegrid')).toHaveLength(3)
		const bars = [...canvasElement.querySelectorAll('.base-gantt')].map(root => root.querySelector('.base-gantt__bar') as HTMLElement)
		await expect(getComputedStyle(bars[0]).backgroundColor).not.toBe(getComputedStyle(bars[1]).backgroundColor)
		await expect(getComputedStyle(bars[2]).backgroundColor).toBe('rgba(0, 0, 0, 0)')
		await expect(canvasElement.querySelectorAll('.base-gantt--soft, .base-gantt--outline')).toHaveLength(2)
	},
}
