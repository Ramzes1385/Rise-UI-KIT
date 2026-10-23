import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAddressInput.stories'
import BaseAddressInput from '../../../ui/BaseAddressInput.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div style="display: flex; flex-direction: column; gap: 16px; max-width: 420px">
		<BaseAddressInput v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" :label="preset.label" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' },
			source: storySource({ template, imports: ['BaseAddressInput'], script: `const presets = ${literal(presets)}` }),
		},
		controls: { include: ['variant'] },
	},
	args: { modelValue: 'г Москва, ул Тверская, д 7' },
	render: args => ({
		components: { BaseAddressInput },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
}
