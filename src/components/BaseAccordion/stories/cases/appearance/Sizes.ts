import { showcaseItems } from '../../shared'
import type meta from '../../BaseAccordion.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAccordion from '../../../ui/BaseAccordion.vue'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	args: { variant: 'outline' },
	argTypes: { sizeScale: { control: false } },
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: текст 12–17px, отступы и иконки масштабируются пропорционально.' },
			source: {
				code: SIZE_PRESETS.map(p => `<BaseAccordion :items="items" variant="outline" :size-scale="${p.sizeScale}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseAccordion },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel, showcaseItems }),
		template: `
			<div class="story-grid" style="--story-grid-min: 320px;">
				<div v-for="(preset, index) in presets" :key="preset.name" class="story-col">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseAccordion v-bind="props" :items="showcaseItems(index)" :size-scale="preset.sizeScale" />
				</div>
			</div>
		`,
	}),
}
