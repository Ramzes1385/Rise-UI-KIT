import { BasePin } from '@components/BasePin'
import type meta from '../../BaseFormField.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFormField from '../../../ui/BaseFormField.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const state = { values: Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, ''])) }

const template = `
	<div class="story-col story-narrow">
		<BaseFormField
			v-for="preset in presets"
			:key="preset.name"
			v-bind="args"
			:size-scale="preset.sizeScale"
			:label="preset.label">
			<BasePin v-model="values[preset.name]" />
		</BaseFormField>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'description', 'error', 'isRequired'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: масштабируются подпись, описание и вложенный контрол без своего `sizeScale`.',
			},
			source: storySource({
				template,
				imports: ['BaseFormField', 'BasePin'],
				script: `const presets = ${literal(presets)}`,
				state,
				types: { values: 'Record<string, string>' },
				omit: ['default', 'label', 'sizeScale'],
			}),
		},
	},
	render: args => ({
		components: { BaseFormField, BasePin },
		setup: useStorySetup(args, { state, data: { presets }, slots: ['default', 'label', 'sizeScale'] }),
		template,
	}),
}
