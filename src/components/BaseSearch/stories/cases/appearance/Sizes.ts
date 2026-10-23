import type { SearchArgs } from '../../shared'
import BaseSearch from '../../../ui/BaseSearch.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const state = { values: { md: 'Лисья тропа' } }

const template = `
	<div class="story-col story-narrow">
		<BaseSearch
			v-for="preset in presets"
			:key="preset.name"
			v-bind="args"
			v-model="values[preset.name]"
			:size-scale="preset.sizeScale"
			:placeholder="preset.label" />
	</div>
`

export const Sizes: StoryObj<SearchArgs> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: высота поля 24, 28, 32, 36 и 40px; иконка, кнопка очистки и список масштабируются вместе.',
			},
			source: storySource({
				template,
				imports: ['BaseSearch'],
				script: `const presets = ${literal(presets)}`,
				state,
				types: { values: 'Record<string, string>' },
				omit: ['modelValue', 'sizeScale', 'placeholder', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseSearch },
		setup: useStorySetup(args, { state, data: { presets }, slots: ['modelValue', 'sizeScale', 'placeholder', 'onUpdate:modelValue'] }),
		template,
	}),
}
