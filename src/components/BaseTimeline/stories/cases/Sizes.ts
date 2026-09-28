import type meta from '../BaseTimeline.stories'
import BaseTimeline from '../../ui/BaseTimeline.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots, SIZE_PRESETS, sizeLabel } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Размеры через `sizeScale`: маркер, отступы и текст масштабируются вместе.' } },
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseTimeline },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['sizeScale']),
			presets: SIZE_PRESETS.filter(preset => ['xs', 'xl'].includes(preset.name)),
			sizeLabel,
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 260px;">
				<div v-for="preset in presets" :key="preset.name" class="story-stack" style="gap: 8px;">
					<span class="story-label">{{ sizeLabel(preset) }}</span>
					<BaseTimeline v-bind="props" :size-scale="preset.sizeScale" />
				</div>
			</div>
		`,
	}),
}
