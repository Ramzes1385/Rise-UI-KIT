import type meta from '../BaseAudioPlayer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAudioPlayer from '../../ui/BaseAudioPlayer.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-col" style="gap: 12px; max-width: 420px;">
		<BaseAudioPlayer v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" :title="preset.label" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' },
			source: storySource({ template, imports: ['BaseAudioPlayer'], script: `const presets = ${literal(presets)}` }),
		},
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseAudioPlayer },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
}
