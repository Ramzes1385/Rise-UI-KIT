import { expect } from 'storybook/test'
import type meta from '../../BaseGantt.stories'
import BaseGantt from '../../../ui/BaseGantt.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-stack">
		<div v-for="preset in presets" :key="preset.name">
			<span class="story-label">{{ preset.label }}</span>
			<BaseGantt v-bind="args" :size-scale="preset.sizeScale" :height="260" />
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'scale'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125. Масштабируются высота строки, ширина списка и столбцов, шрифт, стрелки и ручки.',
			},
			source: storySource({ template, imports: ['BaseGantt'], script: `const presets = ${literal(presets)}` }),
		},
	},
	render: args => ({
		components: { BaseGantt },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const heights = [...canvasElement.querySelectorAll('.base-gantt')].map(
			root => (root.querySelector('[data-row-index="0"]') as HTMLElement).getBoundingClientRect().height,
		)
		await expect(heights).toHaveLength(presets.length)
		await expect(heights[0]).toBeLessThan(heights[heights.length - 1])
	},
}
