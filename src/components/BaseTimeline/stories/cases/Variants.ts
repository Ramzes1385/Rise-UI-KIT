import type meta from '../BaseTimeline.stories'
import BaseTimeline from '../../ui/BaseTimeline.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { TIMELINE_VARIANTS } from '../../types/BaseTimeline.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Варианты маркеров: `default` — заливка, `soft` — мягкий фон, `outline` — кольцо.' } },
		controls: { include: ['sizeScale', 'currentId'] },
	},
	render: args => ({
		components: { BaseTimeline },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant']), variants: TIMELINE_VARIANTS }),
		template: `
			<div class="story-grid" style="--story-grid-min: 260px;">
				<div v-for="variant in variants" :key="variant" class="story-stack" style="gap: 8px;">
					<span class="story-label">{{ variant }}</span>
					<BaseTimeline v-bind="props" :variant="variant" />
				</div>
			</div>
		`,
	}),
}
