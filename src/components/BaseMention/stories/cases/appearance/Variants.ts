import type meta from '../../BaseMention.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseMention from '../../../ui/BaseMention.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { MENTION_VARIANTS } from '../../../types/BaseMention.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Все варианты оформления. Размер из Controls применяется ко всем.' } },
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseMention },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: MENTION_VARIANTS }),
		template:
			'<div style="display: grid; gap: 16px; max-width: 560px"><BaseMention v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="variant" /></div>',
	}),
}
