import { showcaseItems } from '../../shared'
import type meta from '../../BaseAccordion.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAccordion from '../../../ui/BaseAccordion.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map((preset, index) => ({
	name: preset.name,
	sizeScale: preset.sizeScale,
	label: sizeLabel(preset),
	items: showcaseItems(index),
}))

const template = `
	<div class="story-grid" style="--story-grid-min: 320px;">
		<div v-for="preset in presets" :key="preset.name" class="story-col">
			<span class="story-label">{{ preset.label }}</span>
			<BaseAccordion v-bind="args" :items="preset.items" :size-scale="preset.sizeScale" />
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	args: { variant: 'outline' },
	argTypes: { sizeScale: { control: false } },
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: текст 12–17px, отступы и иконки масштабируются пропорционально.' },
			source: storySource({
				template,
				imports: ['BaseAccordion'],
				script: `const presets = ${literal(presets)}`,
				omit: ['items', 'sizeScale'],
			}),
		},
	},
	render: args => ({
		components: { BaseAccordion },
		setup: useStorySetup(args, { data: { presets } }),
		template,
	}),
}
