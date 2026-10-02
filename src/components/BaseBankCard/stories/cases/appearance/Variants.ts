import { expect } from 'storybook/test'
import type meta from '../../BaseBankCard.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseBankCard from '../../../ui/BaseBankCard.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { BANK_CARD_VARIANTS } from '../../../types/BaseBankCard.types'

const template = `<div class="story-col"><BaseBankCard v-for="variant in BANK_CARD_VARIANTS" :key="variant" v-bind="args" :variant="variant" :label="variant" /></div>`

export const Variants: StoryObj<typeof meta> = {
	args: { isCompact: true },
	parameters: {
		docs: {
			description: {
				story: 'Варианты оформления строки `isCompact`: `default`, `soft`, `outline`, `ghost`. Полная карта от варианта не зависит. Размер из Controls применяется ко всем.',
			},
			source: storySource({ template, imports: ['BaseBankCard', 'BANK_CARD_VARIANTS'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseBankCard },
		setup: useStorySetup(args, { data: { BANK_CARD_VARIANTS } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelectorAll('.base-bank-card--compact')).toHaveLength(BANK_CARD_VARIANTS.length)
		for (const variant of BANK_CARD_VARIANTS.slice(1))
			await expect(canvasElement.querySelector(`.base-bank-card--${variant}`)).toHaveClass('base-bank-card--compact')
	},
}
