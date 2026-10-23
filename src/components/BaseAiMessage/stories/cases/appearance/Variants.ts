import type meta from '../../BaseAiMessage.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAiMessage from '../../../ui/BaseAiMessage.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { AI_MESSAGE_VARIANTS } from '../../../types/BaseAiMessage.types'

const template = `
	<div style="display: grid; gap: 24px">
		<BaseAiMessage
			v-for="variant in AI_MESSAGE_VARIANTS"
			:key="variant"
			v-bind="args"
			:variant="variant"
			:content="\`Вариант **\${variant}**.\`" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Все варианты оформления. Размер из Controls применяется ко всем.' },
			source: storySource({ template, imports: ['AI_MESSAGE_VARIANTS', 'BaseAiMessage'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseAiMessage },
		setup: useStorySetup(args, { data: { AI_MESSAGE_VARIANTS } }),
		template,
	}),
}
