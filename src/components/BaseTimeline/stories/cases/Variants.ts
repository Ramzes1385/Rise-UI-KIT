import type meta from '../BaseTimeline.stories'
import BaseTimeline from '../../ui/BaseTimeline.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import { TIMELINE_VARIANTS } from '../../types/BaseTimeline.types'

const template = `
	<div class="story-grid" style="--story-grid-min: 260px;">
		<div v-for="variant in TIMELINE_VARIANTS" :key="variant" class="story-stack" style="gap: 8px;">
			<span class="story-label">{{ variant }}</span>
			<BaseTimeline v-bind="args" :variant="variant" />
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Варианты маркеров: `default` — заливка, `soft` — мягкий фон, `outline` — кольцо.' },
			source: storySource({ template, imports: ['BaseTimeline', 'TIMELINE_VARIANTS'], omit: ['variant'] }),
		},
		controls: { include: ['sizeScale', 'currentId'] },
	},
	render: args => ({
		components: { BaseTimeline },
		setup: useStorySetup(args, { data: { TIMELINE_VARIANTS }, slots: ['variant'] }),
		template,
	}),
}
