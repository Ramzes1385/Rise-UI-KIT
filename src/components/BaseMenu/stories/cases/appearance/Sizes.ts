import { SHORT_ITEMS } from '../../shared'
import type meta from '../../BaseMenu.stories'
import BaseMenu from '../../../ui/BaseMenu.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const items = SHORT_ITEMS

const template = `
	<div class="story-row" style="align-items: flex-start;">
		<div v-for="preset in presets" :key="preset.name" class="story-col">
			<span class="story-label">{{ preset.label }}</span>
			<BaseMenu v-bind="args" :items="items" :size-scale="preset.sizeScale" />
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	argTypes: { sizeScale: { control: false } },
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: высота пункта 24–40px, текст и иконки масштабируются пропорционально.' },
			source: storySource({
				template,
				imports: ['BaseMenu'],
				script: [`const presets = ${literal(presets)}`, `const items = ${literal(items)}`].join('\n'),
			}),
		},
	},
	render: args => ({
		components: { BaseMenu },
		setup: useStorySetup(args, { data: { presets, items } }),
		template,
	}),
}
