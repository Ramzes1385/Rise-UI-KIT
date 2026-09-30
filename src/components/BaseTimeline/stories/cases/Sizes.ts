import type meta from '../BaseTimeline.stories'
import BaseTimeline from '../../ui/BaseTimeline.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.filter(preset => ['xs', 'xl'].includes(preset.name)).map(preset => ({
	name: preset.name,
	sizeScale: preset.sizeScale,
	label: sizeLabel(preset),
}))

const template = `
	<div class="story-grid" style="--story-grid-min: 260px;">
		<div v-for="preset in presets" :key="preset.name" class="story-stack" style="gap: 8px;">
			<span class="story-label">{{ preset.label }}</span>
			<BaseTimeline v-bind="args" :size-scale="preset.sizeScale" />
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: маркер, отступы и текст масштабируются вместе.' },
			source: storySource({
				template,
				imports: ['BaseTimeline'],
				script: `const presets = ${literal(presets)}`,
				omit: ['sizeScale'],
			}),
		},
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseTimeline },
		setup: useStorySetup(args, { data: { presets }, slots: ['sizeScale'] }),
		template,
	}),
}
