import type meta from '../../BaseFileUpload.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFileUpload from '../../../ui/BaseFileUpload.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-grid" style="--story-grid-min: 280px; align-items: end;">
		<BaseFileUpload v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" :label="preset.label" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		maxWidth: 760,
		controls: { include: ['variant'] },
		docs: {
			description: { story: 'Размеры через `sizeScale`: отступы, шрифт и иконки зоны и строк файлов масштабируются вместе.' },
			source: storySource({
				template,
				imports: ['BaseFileUpload'],
				script: `const presets = ${literal(presets)}`,
				omit: ['sizeScale', 'label'],
			}),
		},
	},
	render: args => ({
		components: { BaseFileUpload },
		setup: useStorySetup(args, { data: { presets }, slots: ['sizeScale', 'label'] }),
		template,
	}),
}
