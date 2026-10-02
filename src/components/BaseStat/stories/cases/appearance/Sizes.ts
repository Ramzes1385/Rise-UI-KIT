import type meta from '../../BaseStat.stories'
import BaseStat from '../../../ui/BaseStat.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `<div class="story-row" style="align-items: stretch"><BaseStat v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" :label="preset.label" /></div>`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' },
			source: storySource({ template, imports: ['BaseStat'], script: `const presets = ${literal(presets)}` }),
		},
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseStat },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
}
