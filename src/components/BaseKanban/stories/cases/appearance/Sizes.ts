import { SMALL_COLUMNS } from '../../shared'
import type meta from '../../BaseKanban.stories'
import BaseKanban from '../../../ui/BaseKanban.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div style="display: grid; gap: 24px">
		<BaseKanban v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" :aria-label="preset.label" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' },
			source: storySource({
				template,
				imports: ['BaseKanban'],
				script: `const presets = ${literal(presets)}`,
				omit: ['sizeScale'],
			}),
		},
		controls: { include: ['variant'] },
	},
	args: { columns: SMALL_COLUMNS },
	render: args => ({
		components: { BaseKanban },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
}
