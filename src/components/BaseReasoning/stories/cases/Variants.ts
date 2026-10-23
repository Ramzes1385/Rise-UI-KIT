import type meta from '../BaseReasoning.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseReasoning from '../../ui/BaseReasoning.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { REASONING_VARIANTS } from '../../types/BaseReasoning.types'

const template = `
	<div style="display: grid; gap: 24px">
		<BaseReasoning v-for="variant in REASONING_VARIANTS" :key="variant" v-bind="args" :variant="variant" :title="variant" is-open />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Все варианты оформления. Размер из Controls применяется ко всем.' },
			source: storySource({ template, imports: ['BaseReasoning', 'REASONING_VARIANTS'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseReasoning },
		setup: useStorySetup(args, { data: { REASONING_VARIANTS } }),
		template,
	}),
}
