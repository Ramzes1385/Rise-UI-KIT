import type meta from '../../BaseLink.stories'
import BaseLink from '../../../ui/BaseLink.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-row">
		<BaseLink v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" :label="preset.label" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale` — относительно окружающего текста: 75 / 87.5 / 100 / 112.5 / 125.' },
			source: storySource({
				template,
				imports: ['BaseLink'],
				script: `const presets = ${literal(presets)}`,
				omit: ['linkComponent'],
			}),
		},
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseLink },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
}
