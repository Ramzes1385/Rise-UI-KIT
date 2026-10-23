import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseFilterBuilder.stories'
import BaseFilterBuilder from '../../../ui/BaseFilterBuilder.vue'
import { literal, SIZE_PRESETS, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale }))

const template = `
	<div style="display: flex; flex-direction: column; gap: 16px; max-width: 820px">
		<BaseFilterBuilder v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' },
			source: storySource({
				template,
				imports: ['BaseFilterBuilder'],
				script: `const presets = ${literal(presets)}`,
				omit: ['sizeScale'],
			}),
		},
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseFilterBuilder },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
}
