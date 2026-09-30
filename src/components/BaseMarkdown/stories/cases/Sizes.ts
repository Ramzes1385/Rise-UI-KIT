import type meta from '../BaseMarkdown.stories'
import BaseMarkdown from '../../ui/BaseMarkdown.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const items = SIZE_PRESETS.map(preset => ({ preset, source: `### ${sizeLabel(preset)}\n\nТекст с **выделением** и \`кодом\`.` }))

const template = `
	<div style="display: grid; gap: 16px">
		<BaseMarkdown v-for="item in items" :key="item.preset.name" v-bind="args" :size-scale="item.preset.sizeScale" :source="item.source" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' },
			source: storySource({ template, imports: ['BaseMarkdown'], script: `const items = ${literal(items)}` }),
		},
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseMarkdown },
		setup: useStorySetup(args, { data: { items } }),
		template,
	}),
}
