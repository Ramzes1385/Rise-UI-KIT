import type meta from '../BaseMarquee.stories'
import BaseMarquee from '../../ui/BaseMarquee.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import { MARQUEE_VARIANTS } from '../../types/BaseMarquee.types'

const template = `<div class="story-row"><BaseMarquee v-for="variant in MARQUEE_VARIANTS" :key="variant" v-bind="args" :variant="variant" :label="variant" /></div>`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Все варианты оформления. Размер из Controls применяется ко всем.' },
			source: storySource({ template, imports: ['BaseMarquee', 'MARQUEE_VARIANTS'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseMarquee },
		setup: useStorySetup(args, { data: { MARQUEE_VARIANTS } }),
		template,
	}),
}
