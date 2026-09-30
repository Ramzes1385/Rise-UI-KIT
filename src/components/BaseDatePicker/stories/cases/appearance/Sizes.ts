import type meta from '../../BaseDatePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseDatePicker from '../../../ui/BaseDatePicker.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const state = { values: {} }

const template = `
	<div class="story-col story-narrow">
		<BaseDatePicker
			v-for="preset in presets"
			:key="preset.name"
			v-bind="args"
			v-model="values[preset.name]"
			:size-scale="preset.sizeScale"
			:placeholder="preset.label" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['inputVariant'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: поле 24, 28, 32, 36 и 40px — как кнопка и `BaseInput` того же размера; панель масштабируется так же.',
			},
			source: storySource({
				template,
				imports: ['BaseDatePicker'],
				script: `const presets = ${literal(presets)}`,
				state,
				types: { values: 'Record<string, Date | null>' },
				omit: ['modelValue', 'label', 'sizeScale', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseDatePicker },
		setup: useStorySetup(args, { state, data: { presets }, slots: ['modelValue', 'label', 'sizeScale', 'onUpdate:modelValue'] }),
		template,
	}),
}
