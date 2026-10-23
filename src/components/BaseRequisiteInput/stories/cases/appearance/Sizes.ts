import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseRequisiteInput.stories'
import BaseRequisiteInput from '../../../ui/BaseRequisiteInput.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px">
		<BaseRequisiteInput v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" :label="preset.label" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' },
			source: storySource({ template, imports: ['BaseRequisiteInput'], script: `const presets = ${literal(presets)}` }),
		},
		controls: { include: ['variant'] },
	},
	args: { modelValue: '7707083893' },
	render: args => ({
		components: { BaseRequisiteInput },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
}
