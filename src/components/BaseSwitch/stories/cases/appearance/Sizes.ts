import type meta from '../../BaseSwitch.stories'
import BaseSwitch from '../../../ui/BaseSwitch.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const state = { values: Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, true])) }

const template = `
	<div class="story-col">
		<BaseSwitch
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
			description: {
				story: 'Размеры через `sizeScale`: трек 27×15, 31.5×17.5, 36×20, 40.5×22.5 и 45×25px, подпись масштабируется вместе с ним.',
			},
			source: storySource({
				template,
				imports: ['BaseSwitch'],
				script: `const presets = ${literal(presets)}`,
				state,
				omit: ['default', 'modelValue', 'label', 'sizeScale', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseSwitch },
		setup: useStorySetup(args, {
			state,
			data: { presets },
			slots: ['default', 'modelValue', 'label', 'sizeScale', 'onUpdate:modelValue'],
		}),
		template,
	}),
}
