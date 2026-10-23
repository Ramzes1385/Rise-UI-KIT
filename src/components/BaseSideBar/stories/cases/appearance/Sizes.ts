import type meta from '../../BaseSideBar.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSideBar from '../../../ui/BaseSideBar.vue'
import { SLOT_KEYS, BASIC_ITEMS } from '../../shared'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const items = BASIC_ITEMS

const hidden = [...SLOT_KEYS, 'isCollapsed', 'onUpdate:isCollapsed', 'title', 'items', 'sizeScale', 'width']

const template = `
	<div class="story-row" style="align-items: stretch; height: 280px;">
		<BaseSideBar
			v-for="preset in presets"
			:key="preset.name"
			v-bind="args"
			:items="items"
			:title="preset.label"
			:aria-label="'Боковая панель: ' + preset.name"
			:width="200"
			:size-scale="preset.sizeScale"
			active-path="/dashboard" />
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	argTypes: { sizeScale: { control: false } },
	parameters: {
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: ширина панели, высота пунктов (24–40px), текст и иконки масштабируются пропорционально.',
			},
			source: storySource({
				template,
				imports: ['BaseSideBar'],
				script: [`const presets = ${literal(presets)}`, `const items = ${literal(items)}`].join('\n'),
				omit: [...hidden, 'linkComponent'],
			}),
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup: useStorySetup(args, { data: { presets, items }, slots: hidden }),
		template,
	}),
}
