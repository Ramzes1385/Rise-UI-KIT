import type meta from '../../BaseCascader.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCascader from '../../../ui/BaseCascader.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const state = { values: {} }

const template = `
	<div class="story-col story-narrow">
		<BaseCascader
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
		controls: { include: ['variant'] },
		docs: {
			description: { story: 'Размеры через `sizeScale`: высота поля 24, 28, 32, 36 и 40px — как у `BaseSelect` того же размера.' },
			source: storySource({
				template,
				imports: ['BaseCascader'],
				script: `const presets = ${literal(presets)}`,
				state,
				types: { values: 'Record<string, string[]>' },
				omit: ['modelValue', 'label', 'sizeScale', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseCascader },
		setup: useStorySetup(args, { state, data: { presets }, slots: ['modelValue', 'label', 'sizeScale', 'onUpdate:modelValue'] }),
		template,
	}),
}
