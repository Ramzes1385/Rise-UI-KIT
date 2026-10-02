import BaseTag from '../../../ui/BaseTag.vue'
import type meta from '../../BaseTag.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `<div class="story-row"><BaseTag v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" :label="preset.label" /></div>`

export const Sizes: StoryObj<typeof meta> = {
	args: { isRemovable: true },
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125 — вместе с кнопкой удаления и значками.' },
			source: storySource({
				template,
				imports: ['BaseTag'],
				script: `const presets = ${literal(presets)}`,
				omit: ['sizeScale', 'label'],
			}),
		},
		controls: { include: ['variant', 'tone', 'isRemovable'] },
	},
	render: args => ({
		components: { BaseTag },
		setup: useStorySetup(args, { data: { presets }, slots: ['default'] }),
		template,
	}),
}
