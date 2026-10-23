import type meta from '../../BaseMoneyInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseMoneyInput from '../../../ui/BaseMoneyInput.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div style="display: flex; flex-direction: column; gap: 16px; max-width: 320px">
		<BaseMoneyInput v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" :label="preset.label" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' },
			source: storySource({ template, imports: ['BaseMoneyInput'], script: `const presets = ${literal(presets)}` }),
		},
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseMoneyInput },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
}
