import { SMALL } from '../shared'
import type meta from '../BaseJsonViewer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseJsonViewer from '../../ui/BaseJsonViewer.vue'
import { JSON_VIEWER_VARIANTS } from '../../types/BaseJsonViewer.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Варианты: default — рамка, soft — подложка без рамки, outline — рамка accented, ghost — без рамки и фона.',
			},
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseJsonViewer },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: JSON_VIEWER_VARIANTS, small: SMALL }),
		template: `
			<div class="story-grid" style="--story-grid-min: 280px">
				<BaseJsonViewer v-for="variant in variants" :key="variant" v-bind="props" :value="small" :variant="variant" :label="variant" />
			</div>
		`,
	}),
}
