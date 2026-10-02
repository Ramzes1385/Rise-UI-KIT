import type meta from '../BaseBankCard.stories'
import BaseBankCard from '../../ui/BaseBankCard.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import { BANK_CARD_VARIANTS } from '../../types/BaseBankCard.types'

const template = `<div class="story-row"><BaseBankCard v-for="variant in BANK_CARD_VARIANTS" :key="variant" v-bind="args" :variant="variant" :label="variant" /></div>`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Все варианты оформления. Размер из Controls применяется ко всем.' },
			source: storySource({ template, imports: ['BaseBankCard', 'BANK_CARD_VARIANTS'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseBankCard },
		setup: useStorySetup(args, { data: { BANK_CARD_VARIANTS } }),
		template,
	}),
}
