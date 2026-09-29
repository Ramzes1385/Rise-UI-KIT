import type meta from '../../BaseSideBar.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSideBar from '../../../ui/BaseSideBar.vue'
import { SLOT_KEYS, BASIC_ITEMS } from '../../shared'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	argTypes: { sizeScale: { control: false } },
	parameters: {
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: ширина панели, высота пунктов (24–40px), текст и иконки масштабируются пропорционально.',
			},
			source: { code: SIZE_PRESETS.map(p => `<BaseSideBar :items="items" :width="200" :size-scale="${p.sizeScale}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...SLOT_KEYS, 'isCollapsed', 'onUpdate:isCollapsed', 'title', 'items', 'sizeScale', 'width']),
			presets: SIZE_PRESETS,
			sizeLabel,
			items: BASIC_ITEMS,
		}),
		template: `
			<div class="story-row" style="align-items: stretch; height: 280px;">
				<BaseSideBar
					v-for="preset in presets"
					:key="preset.name"
					v-bind="props"
					:items="items"
					:title="sizeLabel(preset)"
					:aria-label="'Боковая панель: ' + preset.name"
					:width="200"
					:size-scale="preset.sizeScale"
					active-path="/dashboard" />
			</div>
		`,
	}),
}
