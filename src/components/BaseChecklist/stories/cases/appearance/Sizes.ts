import type meta from '../../BaseChecklist.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseChecklist from '../../../ui/BaseChecklist.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px">
		<BaseChecklist
			v-for="preset in presets"
			:key="preset.name"
			v-bind="args"
			:size-scale="preset.sizeScale"
			:title="preset.label"
			style="width: 360px" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' },
			source: storySource({
				template,
				imports: ['BaseChecklist'],
				script: `const presets = ${literal(presets)}`,
				omit: ['sizeScale', 'title'],
			}),
		},
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseChecklist },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
}
