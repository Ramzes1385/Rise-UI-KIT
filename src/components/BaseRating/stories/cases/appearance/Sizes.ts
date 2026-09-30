import type meta from '../../BaseRating.stories'
import BaseRating from '../../../ui/BaseRating.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const state = { values: Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, 3])) }

const template = `
	<div class="story-col">
		<div v-for="preset in presets" :key="preset.name" class="story-row">
			<span class="story-label">{{ preset.label }}</span>
			<BaseRating v-bind="args" v-model="values[preset.name]" :size-scale="preset.sizeScale" />
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: звезда 15, 17.5, 20, 22.5 и 25px; коробка вариантов — 24–40px, как поле того же размера.',
			},
			source: storySource({
				template,
				imports: ['BaseRating'],
				script: `const presets = ${literal(presets)}`,
				state,
				types: { values: 'Record<string, number>' },
				omit: ['default', 'modelValue', 'sizeScale', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseRating },
		setup: useStorySetup(args, { state, data: { presets }, slots: ['default', 'modelValue', 'sizeScale', 'onUpdate:modelValue'] }),
		template,
	}),
}
