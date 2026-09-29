import type meta from '../../BaseToolCall.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseToolCall from '../../../ui/BaseToolCall.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { TOOL_CALL_VARIANTS } from '../../../types/BaseToolCall.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Все варианты оформления. Размер из Controls применяется ко всем.' } },
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseToolCall },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: TOOL_CALL_VARIANTS }),
		template:
			'<div style="display: grid; gap: 12px; max-width: 560px"><BaseToolCall v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :title="variant" is-open /></div>',
	}),
}
