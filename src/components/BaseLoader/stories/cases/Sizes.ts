import type meta from '../BaseLoader.stories'
import BaseLoader from '../../ui/BaseLoader.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SIZE_PRESETS, useArgsWithoutSlots, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'hasLabel'] },
		docs: {
			description: { story: 'Размеры задаются `sizeScale`: при 100 индикатор 32 × 32px. Внутри поля или кнопки используйте 50–60.' },
			source: { code: SIZE_PRESETS.map(preset => `<BaseLoader :size-scale="${preset.sizeScale}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseLoader },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-row" style="align-items: flex-end; gap: 24px;">
				<div v-for="preset in presets" :key="preset.name" class="story-col" style="align-items: center; text-align: center;">
					<BaseLoader v-bind="props" :size-scale="preset.sizeScale" />
					<span class="story-label">{{ sizeLabel(preset) }}</span>
				</div>
			</div>
		`,
	}),
}
