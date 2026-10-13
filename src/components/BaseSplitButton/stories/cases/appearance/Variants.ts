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
			description: { story: 'Варианты — как у BaseButton.' },
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
}
