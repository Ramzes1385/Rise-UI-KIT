import { items } from '../../shared'
import type meta from '../../BaseAnchor.stories'
import BaseAnchor from '../../../ui/BaseAnchor.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-row" style="align-items: flex-start">
		<div v-for="preset in presets" :key="preset.name" class="story-col">
			<span class="story-label">{{ preset.label }}</span>
			<BaseAnchor v-bind="args" :size-scale="preset.sizeScale" :items="items" :label="'Содержание: ' + preset.label" />
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125.' },
			source: storySource({
				template,
				imports: ['BaseAnchor'],
				script: `const presets = ${literal(presets)}\nconst items = ${literal(items)}`,
			}),
		},
		controls: { include: ['variant', 'direction'] },
	},
	render: args => ({
		components: { BaseAnchor },
		setup: useStorySetup(args, { data: { presets, items } }),
		template,
	}),
}
