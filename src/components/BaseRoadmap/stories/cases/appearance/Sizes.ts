import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `<div class="story-row"><BaseRoadmap v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" /></div>`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' },
			source: storySource({ template, imports: ['BaseRoadmap'], script: `const presets = ${literal(presets)}` }),
		},
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseRoadmap },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
}
