import { FRAME } from '../../shared'
import BaseFab from '../../../ui/BaseFab.vue'
import type meta from '../../BaseFab.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const POSITIONS = ['bottom-left', 'top-left', 'bottom-right']

const sizes = SIZE_PRESETS.filter(preset => ['xs', 'md', 'xl'].includes(preset.name)).map((preset, index) => ({
	name: preset.name,
	sizeScale: preset.sizeScale,
	position: POSITIONS[index],
	label: sizeLabel(preset),
}))

const CONTENT_ARGS = ['sizeScale', 'position', 'label']

const template = `
	<div style="${FRAME}">
		<BaseFab v-for="size in sizes" :key="size.name" v-bind="args" :size-scale="size.sizeScale" :position="size.position" :label="size.label" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 42, 56 и 70px.' },
			source: storySource({ template, imports: ['BaseFab'], script: `const sizes = ${literal(sizes)}`, omit: CONTENT_ARGS }),
		},
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseFab },
		setup: useStorySetup(args, { slots: CONTENT_ARGS, data: { sizes } }),
		template,
	}),
}
