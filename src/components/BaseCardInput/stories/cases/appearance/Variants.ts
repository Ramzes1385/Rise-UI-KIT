import type meta from '../../BaseCardInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCardInput from '../../../ui/BaseCardInput.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { CARD_INPUT_VARIANTS } from '../../../types/BaseCardInput.types'

const template = `<div class="story-grid" style="--story-grid-min: 300px"><BaseCardInput v-for="variant in CARD_INPUT_VARIANTS" :key="variant" v-bind="args" :variant="variant" :label="variant" /></div>`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Все варианты оформления. Размер из Controls применяется ко всем.' },
			source: storySource({ template, imports: ['BaseCardInput', 'CARD_INPUT_VARIANTS'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseCardInput },
		setup: useStorySetup(args, { data: { CARD_INPUT_VARIANTS } }),
		template,
	}),
}
