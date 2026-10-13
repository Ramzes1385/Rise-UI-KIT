import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAvatarCropper.stories'
import BaseAvatarCropper from '../../../ui/BaseAvatarCropper.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-row" style="align-items: flex-start">
		<BaseAvatarCropper
			v-for="preset in presets"
			:key="preset.name"
			v-bind="args"
			:size="160"
			:size-scale="preset.sizeScale"
			:label="'Кадрирование, ' + preset.label" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125% от `size` 160px — область и ползунок.' },
			source: storySource({ template, imports: ['BaseAvatarCropper'], script: `const presets = ${literal(presets)}` }),
		},
		controls: { include: ['variant', 'shape'] },
	},
	render: args => ({
		components: { BaseAvatarCropper },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
}
