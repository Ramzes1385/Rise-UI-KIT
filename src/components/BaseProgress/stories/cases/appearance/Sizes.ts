import type meta from '../../BaseProgress.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseProgress from '../../../ui/BaseProgress.vue'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['value', 'shape', 'hasLabel'] },
		docs: {
			description: { story: 'Размеры задаются `sizeScale`: высота полосы 6, 7, 8, 9 и 10px, кольцо — 48–80px.' },
			source: { code: SIZE_PRESETS.map(preset => `<BaseProgress :value="60" :size-scale="${preset.sizeScale}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseProgress },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-stack">
				<div v-for="preset in presets" :key="preset.name" class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseProgress v-bind="props" :size-scale="preset.sizeScale" :aria-label="sizeLabel(preset)" />
				</div>
			</div>
		`,
	}),
}
