import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseSplitButton.stories'
import BaseSplitButton from '../../../ui/BaseSplitButton.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { SPLIT_BUTTON_VARIANTS } from '../../../types/BaseSplitButton.types'

const variants = SPLIT_BUTTON_VARIANTS

const template = `
	<div class="story-row"><BaseSplitButton v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" /></div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Варианты — как у BaseButton: `default`, `ghost`, `outline`, `shadow`, `soft` и `tonal` — нейтральная заливка для вторичных действий.',
			},
			source: storySource({
				template,
				imports: ['BaseSplitButton'],
				script: `const variants = ${literal(variants)}`,
				omit: ['variant'],
			}),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseSplitButton },
		setup: useStorySetup(args, { data: { variants }, slots: ['variant'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		for (const variant of variants) await expect(canvasElement.querySelector(`.base-split-button--${variant}`)).toBeInTheDocument()
	},
}
