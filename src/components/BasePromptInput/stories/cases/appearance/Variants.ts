import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BasePromptInput.stories'
import BasePromptInput from '../../../ui/BasePromptInput.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { PROMPT_INPUT_VARIANTS } from '../../../types/BasePromptInput.types'

const state = { values: Object.fromEntries(PROMPT_INPUT_VARIANTS.map(variant => [variant, ''])) }

const template = `
	<div style="display: grid; gap: 16px; max-width: 640px">
		<BasePromptInput
			v-for="variant in PROMPT_INPUT_VARIANTS"
			:key="variant"
			v-bind="args"
			v-model="values[variant]"
			:variant="variant"
			:label="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Все варианты оформления. Размер из Controls применяется ко всем.' },
			source: storySource({
				template,
				imports: ['BasePromptInput', 'PROMPT_INPUT_VARIANTS'],
				state,
				types: { values: 'Record<string, string>' },
			}),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BasePromptInput },
		setup: useStorySetup(args, { state, data: { PROMPT_INPUT_VARIANTS } }),
		template,
	}),
}
