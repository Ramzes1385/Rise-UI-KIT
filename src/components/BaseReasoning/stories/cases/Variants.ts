import type meta from '../BaseReasoning.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseReasoning from '../../ui/BaseReasoning.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { REASONING_VARIANTS } from '../../types/BaseReasoning.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Все варианты оформления. Размер из Controls применяется ко всем.' } },
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseReasoning },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: REASONING_VARIANTS }),
		template:
			'<div style="display: grid; gap: 24px"><BaseReasoning v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :title="variant" is-open /></div>',
	}),
}
