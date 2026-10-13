import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseSignaturePad.stories'
import BaseSignaturePad from '../../../ui/BaseSignaturePad.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-row" style="align-items: flex-start">
		<BaseSignaturePad
			v-for="preset in presets"
			:key="preset.name"
			v-bind="args"
			:width="200"
			:height="80"
			:size-scale="preset.sizeScale"
			:label="preset.label" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125% — поле, подпись и кнопки.' },
			source: storySource({ template, imports: ['BaseSignaturePad'], script: `const presets = ${literal(presets)}` }),
		},
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseSignaturePad },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
}
