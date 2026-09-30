import type meta from '../../BaseStepper.stories'
import { MODEL_KEYS, SLOT_KEYS } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseStepper from '../../../ui/BaseStepper.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const state = { steps: Object.fromEntries(SIZE_PRESETS.map(preset => [preset.name, 2])) }

const hidden = [...MODEL_KEYS, ...SLOT_KEYS, 'sizeScale']

const template = `
	<div class="story-stack">
		<div v-for="preset in presets" :key="preset.name" class="story-stack">
			<span class="story-label">{{ preset.label }}</span>
			<BaseStepper v-bind="args" v-model="steps[preset.name]" :size-scale="preset.sizeScale" />
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['shape', 'orientation'] },
		docs: {
			description: { story: 'Размеры через `sizeScale`: индикатор 21–35px, подписи и линия масштабируются пропорционально.' },
			source: storySource({
				template,
				imports: ['BaseStepper'],
				script: `const presets = ${literal(presets)}`,
				state,
				types: { steps: 'Record<string, number>' },
				omit: hidden,
			}),
		},
	},
	render: args => ({
		components: { BaseStepper },
		setup: useStorySetup(args, { state, data: { presets }, slots: hidden }),
		template,
	}),
}
