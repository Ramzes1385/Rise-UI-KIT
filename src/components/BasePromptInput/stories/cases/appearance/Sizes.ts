import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BasePromptInput.stories'
import BasePromptInput from '../../../ui/BasePromptInput.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const state = { values: Object.fromEntries(presets.map(preset => [preset.name, ''])) }

const template = `
	<div style="display: grid; gap: 16px; max-width: 640px">
		<BasePromptInput
			v-for="preset in presets"
			:key="preset.name"
			v-bind="args"
			v-model="values[preset.name]"
			:size-scale="preset.sizeScale"
			:label="preset.label" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' },
			source: storySource({
				template,
				imports: ['BasePromptInput'],
				script: `const presets = ${literal(presets)}`,
				state,
				types: { values: 'Record<string, string>' },
			}),
		},
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BasePromptInput },
		setup: useStorySetup(args, { state, data: { presets } }),
		template,
	}),
}
