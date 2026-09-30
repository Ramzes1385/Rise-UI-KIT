import type meta from '../../BaseChecklist.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseChecklist from '../../../ui/BaseChecklist.vue'
import { CHECKLIST_VARIANTS } from '../../../types/BaseChecklist.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'default — карточка в рамке, soft — на подложке, outline — рамка без фона, ghost — без рамки и отступов.',
			},
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseChecklist },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: CHECKLIST_VARIANTS }),
		template: `
			<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px">
				<BaseChecklist v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :title="variant" />
			</div>`,
	}),
}
