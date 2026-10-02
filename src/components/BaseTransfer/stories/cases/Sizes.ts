import type meta from '../BaseTransfer.stories'
import BaseTransfer from '../../ui/BaseTransfer.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `<div class="story-stack"><BaseTransfer v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" :label="preset.label" /></div>`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' },
			source: storySource({ template, imports: ['BaseTransfer'], script: `const presets = ${literal(presets)}` }),
		},
		controls: { include: ['variant'] },
	},
	args: { height: 160 },
	render: args => ({
		components: { BaseTransfer },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
}
