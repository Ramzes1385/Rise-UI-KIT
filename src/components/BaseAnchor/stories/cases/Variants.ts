import type meta from '../BaseAnchor.stories'
import BaseAnchor from '../../ui/BaseAnchor.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { ANCHOR_VARIANTS } from '../../types/BaseAnchor.types'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `<div class="story-row"><BaseAnchor v-for="variant in ANCHOR_VARIANTS" :key="variant" v-bind="args" :variant="variant" :label="variant" /></div>`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Все варианты оформления. Размер из Controls применяется ко всем.' },
			source: storySource({ template, imports: ['BaseAnchor', 'ANCHOR_VARIANTS'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseAnchor },
		setup: useStorySetup(args, { data: { ANCHOR_VARIANTS } }),
		template,
	}),
}
