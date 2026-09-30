import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCheckboxGroup.stories'
import BaseCheckboxGroup from '../../../ui/BaseCheckboxGroup.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.filter(preset => ['xs', 'md', 'xl'].includes(preset.name)).map(preset => ({
	name: preset.name,
	sizeScale: preset.sizeScale,
	label: sizeLabel(preset),
}))

const template = `
	<div class="story-stack">
		<BaseCheckboxGroup v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" :label="preset.label" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: подпись, флажки и зазоры масштабируются вместе.' },
			source: storySource({
				template,
				imports: ['BaseCheckboxGroup'],
				script: `const presets = ${literal(presets)}`,
				omit: ['sizeScale', 'label'],
			}),
		},
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseCheckboxGroup },
		setup: useStorySetup(args, { data: { presets }, slots: ['sizeScale', 'label'] }),
		template,
	}),
}
