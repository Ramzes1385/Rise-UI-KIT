import { SMALL } from '../shared'
import type meta from '../BaseJsonViewer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseJsonViewer from '../../ui/BaseJsonViewer.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-stack">
		<BaseJsonViewer
			v-for="preset in presets"
			:key="preset.name"
			v-bind="args"
			:value="small"
			:has-toolbar="false"
			:size-scale="preset.sizeScale"
			:label="preset.label" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125 — дерево и кнопки панели вместе.' },
			source: storySource({
				template,
				imports: ['BaseJsonViewer'],
				script: [`const presets = ${literal(presets)}`, `const small = ${literal(SMALL)}`].join('\n'),
				omit: ['value', 'hasToolbar', 'sizeScale', 'label'],
			}),
		},
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseJsonViewer },
		setup: useStorySetup(args, { data: { presets, small: SMALL } }),
		template,
	}),
}
