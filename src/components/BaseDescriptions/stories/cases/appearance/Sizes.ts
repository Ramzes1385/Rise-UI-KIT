import { SHORT } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDescriptions.stories'
import BaseDescriptions from '../../../ui/BaseDescriptions.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, title: sizeLabel(preset) }))

const template = `<div class="story-stack"><BaseDescriptions v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" :title="preset.title" /></div>`

export const Sizes: StoryObj<typeof meta> = {
	args: { items: SHORT },
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125 — текст, отступы и кнопки копирования.' },
			source: storySource({ template, imports: ['BaseDescriptions'], script: `const presets = ${literal(presets)}` }),
		},
		controls: { include: ['variant', 'layout'] },
	},
	render: args => ({
		components: { BaseDescriptions },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
}
