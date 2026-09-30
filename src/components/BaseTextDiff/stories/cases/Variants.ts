import type meta from '../BaseTextDiff.stories'
import BaseTextDiff from '../../ui/BaseTextDiff.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SHORT_AFTER, SHORT_BEFORE } from '../shared'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { TEXT_DIFF_VARIANTS } from '../../types/BaseTextDiff.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Варианты: default — рамка, soft — подложка без рамки, outline — рамка accented, ghost — без рамки и фона.',
			},
		},
		controls: { include: ['sizeScale', 'mode'] },
	},
	render: args => ({
		components: { BaseTextDiff },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: TEXT_DIFF_VARIANTS, before: SHORT_BEFORE, after: SHORT_AFTER }),
		template: `
			<div class="story-grid" style="--story-grid-min: 300px">
				<BaseTextDiff v-for="variant in variants" :key="variant" v-bind="props" :before="before" :after="after" :variant="variant" :label="variant" />
			</div>
		`,
	}),
}
