import type meta from '../../BaseToolCall.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseToolCall from '../../../ui/BaseToolCall.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { TOOL_CALL_VARIANTS } from '../../../types/BaseToolCall.types'

const template = `
	<div style="display: grid; gap: 12px; max-width: 560px">
		<BaseToolCall v-for="variant in TOOL_CALL_VARIANTS" :key="variant" v-bind="args" :variant="variant" :title="variant" is-open />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Все варианты оформления. Размер из Controls применяется ко всем.' },
			source: storySource({ template, imports: ['BaseToolCall', 'TOOL_CALL_VARIANTS'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseToolCall },
		setup: useStorySetup(args, { data: { TOOL_CALL_VARIANTS } }),
		template,
	}),
}
