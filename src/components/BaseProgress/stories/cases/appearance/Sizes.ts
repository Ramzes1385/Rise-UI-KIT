import type meta from '../../BaseProgress.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseProgress from '../../../ui/BaseProgress.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-stack">
		<div v-for="preset in presets" :key="preset.name" class="story-row" style="flex-wrap: nowrap;">
			<span class="story-label">{{ preset.label }}</span>
			<BaseProgress v-bind="args" :size-scale="preset.sizeScale" :aria-label="preset.label" />
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['value', 'shape', 'hasLabel'] },
		docs: {
			description: { story: 'Размеры задаются `sizeScale`: высота полосы 6, 7, 8, 9 и 10px, кольцо — 48–80px.' },
			source: storySource({ template, imports: ['BaseProgress'], script: `const presets = ${literal(presets)}` }),
		},
	},
	render: args => ({
		components: { BaseProgress },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
}
