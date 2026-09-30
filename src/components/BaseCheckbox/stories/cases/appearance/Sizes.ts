import type meta from '../../BaseCheckbox.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCheckbox from '../../../ui/BaseCheckbox.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const state = { values: Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, true])) }

const template = `
	<div class="story-col">
		<BaseCheckbox
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
		controls: { include: ['variant'] },
		docs: {
			description: { story: 'Размеры через `sizeScale`: квадрат 12, 14, 16, 18 и 20px, подпись масштабируется вместе с ним.' },
			source: storySource({
				template,
				imports: ['BaseCheckbox'],
				script: `const presets = ${literal(presets)}`,
				state,
				omit: ['modelValue', 'label', 'sizeScale', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseCheckbox },
		setup: useStorySetup(args, { state, data: { presets }, slots: ['modelValue', 'label', 'sizeScale', 'onUpdate:modelValue'] }),
		template,
	}),
}
