import type meta from '../../BaseRange.stories'
import BaseRange from '../../../ui/BaseRange.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const state = { values: Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, 60])) }

const template = `
	<div class="story-stack story-narrow">
		<div v-for="preset in presets" :key="preset.name" class="story-row" style="flex-wrap: nowrap;">
			<span class="story-label">{{ preset.label }}</span>
			<BaseRange v-bind="args" v-model="values[preset.name]" :size-scale="preset.sizeScale" :aria-label="preset.label" />
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			description: { story: 'Размеры через `sizeScale`: трек 4.5–7.5px, бегунок 12–20px и область нажатия масштабируются вместе.' },
			source: storySource({
				template,
				imports: ['BaseRange'],
				script: `const presets = ${literal(presets)}`,
				state,
				types: { values: 'Record<string, number>' },
				omit: ['modelValue', 'sizeScale', 'ariaLabel', 'thumb', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseRange },
		setup: useStorySetup(args, {
			state,
			data: { presets },
			slots: ['modelValue', 'sizeScale', 'ariaLabel', 'thumb', 'onUpdate:modelValue'],
		}),
		template,
	}),
}
