import { SHORT_ITEMS } from '../../shared'
import type meta from '../../BaseMenu.stories'
import BaseMenu from '../../../ui/BaseMenu.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	argTypes: { sizeScale: { control: false } },
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: высота пункта 24–40px, текст и иконки масштабируются пропорционально.' },
			source: { code: SIZE_PRESETS.map(p => `<BaseMenu :items="items" :size-scale="${p.sizeScale}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseMenu },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel, items: SHORT_ITEMS }),
		template: `
			<div class="story-row" style="align-items: flex-start;">
				<div v-for="preset in presets" :key="preset.name" class="story-col">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseMenu v-bind="props" :items="items" :size-scale="preset.sizeScale" />
				</div>
			</div>
		`,
	}),
}
