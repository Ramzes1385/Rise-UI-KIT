import type meta from '../../BaseChart.stories'
import BaseChart from '../../../ui/BaseChart.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-stack">
		<BaseChart v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" :label="preset.label" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125 — подписи осей, легенда и подсказка. Высоту области задаёт `height`.',
			},
			source: storySource({ template, imports: ['BaseChart'], script: `const presets = ${literal(presets)}` }),
		},
		controls: { include: ['variant', 'height'] },
	},
	args: { height: 160 },
	render: args => ({
		components: { BaseChart },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
}
