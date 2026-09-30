import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseFilterBuilder.stories'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseFilterBuilder from '../../../ui/BaseFilterBuilder.vue'
import { FILTER_BUILDER_VARIANTS } from '../../../types/BaseFilterBuilder.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'default — панель в рамке, soft — на подложке, outline — рамка без фона, ghost — без рамки и отступов.' },
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseFilterBuilder },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: FILTER_BUILDER_VARIANTS }),
		template: `
			<div style="display: flex; flex-direction: column; gap: 16px; max-width: 720px">
				<BaseFilterBuilder v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" />
			</div>`,
	}),
}
