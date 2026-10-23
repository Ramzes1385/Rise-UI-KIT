import type meta from '../../BaseRadio.stories'
import BaseRadio from '../../../ui/BaseRadio.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const state = { values: Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, 'courier'])) }

const template = `
	<div class="story-stack">
		<BaseRadio
			v-for="preset in presets"
			:key="preset.name"
			v-bind="args"
			v-model="values[preset.name]"
			:name="'size-' + preset.name"
			:size-scale="preset.sizeScale"
			:label="preset.label" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'isVertical'] },
		docs: {
			description: { story: 'Размеры через `sizeScale`: круг 12, 14, 16, 18 и 20px, подписи масштабируются вместе с ним.' },
			source: storySource({
				template,
				imports: ['BaseRadio'],
				script: `const presets = ${literal(presets)}`,
				state,
				types: { values: 'Record<string, string | number>' },
				omit: ['default', 'modelValue', 'name', 'label', 'sizeScale', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseRadio },
		setup: useStorySetup(args, {
			state,
			data: { presets },
			slots: ['default', 'modelValue', 'name', 'label', 'sizeScale', 'onUpdate:modelValue'],
		}),
		template,
	}),
}
