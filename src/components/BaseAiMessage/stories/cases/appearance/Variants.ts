import type meta from '../../BaseAiMessage.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseAiMessage from '../../../ui/BaseAiMessage.vue'
import { AI_MESSAGE_VARIANTS } from '../../../types/BaseAiMessage.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Все варианты оформления. Размер из Controls применяется ко всем.' } },
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseAiMessage },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: AI_MESSAGE_VARIANTS }),
		template:
			'<div style="display: grid; gap: 24px"><BaseAiMessage v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :content="`Вариант **${variant}**.`" /></div>',
	}),
}
