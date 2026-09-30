import { expect } from 'storybook/test'
import BasePin from '../../../ui/BasePin.vue'
import type meta from '../../BasePin.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const state = { values: Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, '48'])) }

const template = `
	<div class="story-col">
		<div v-for="preset in presets" :key="preset.name" class="story-row">
			<span class="story-label">{{ preset.label }}</span>
			<BasePin v-bind="args" v-model="values[preset.name]" :size-scale="preset.sizeScale" :aria-label="'Код, размер ' + preset.name" />
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'length'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: ячейки 24, 28, 32, 36 и 40px — такие же, как высота инпута и кнопки того же размера.',
			},
			source: storySource({
				template,
				imports: ['BasePin'],
				script: `const presets = ${literal(presets)}`,
				state,
				types: { values: 'Record<string, string>' },
				omit: ['default', 'modelValue', 'sizeScale', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BasePin },
		setup: useStorySetup(args, { state, data: { presets }, slots: ['default', 'modelValue', 'sizeScale', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const heights = ['xs', 'md', 'xl'].map(
			name =>
				canvas
					.getByRole('group', { name: `Код, размер ${name}` })
					.querySelector('input')!
					.getBoundingClientRect().height,
		)
		await expect(heights).toEqual([24, 32, 40])
	},
}
