import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BasePromptInput.stories'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BasePromptInput from '../../../ui/BasePromptInput.vue'
import { PROMPT_INPUT_VARIANTS } from '../../../types/BasePromptInput.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Все варианты оформления. Размер из Controls применяется ко всем.' } },
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BasePromptInput },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: PROMPT_INPUT_VARIANTS }),
		template:
			'<div style="display: grid; gap: 16px; max-width: 640px"><BasePromptInput v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="variant" /></div>',
	}),
}
