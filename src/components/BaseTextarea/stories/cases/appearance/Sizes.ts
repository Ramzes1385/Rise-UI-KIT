import type meta from '../../BaseTextarea.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTextarea from '../../../ui/BaseTextarea.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const state = { values: Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, ''])) }

const template = `
	<div class="story-col story-narrow">
		<BaseTextarea
			v-for="preset in presets"
			:key="preset.name"
			v-bind="args"
			v-model="values[preset.name]"
			:rows="1"
			:size-scale="preset.sizeScale"
			:placeholder="preset.label" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale` при `rows` = 1: высота 24, 28, 32, 36 и 40px — как у инпута и кнопки того же размера.',
			},
			source: storySource({
				template,
				imports: ['BaseTextarea'],
				script: `const presets = ${literal(presets)}`,
				state,
				types: { values: 'Record<string, string>' },
				omit: ['default', 'modelValue', 'label', 'sizeScale', 'rows', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseTextarea },
		setup: useStorySetup(args, {
			state,
			data: { presets },
			slots: ['default', 'modelValue', 'label', 'sizeScale', 'rows', 'onUpdate:modelValue'],
		}),
		template,
	}),
}
