import type meta from '../../BaseStat.stories'
import BaseStat from '../../../ui/BaseStat.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { STAT_VARIANTS } from '../../../types/BaseStat.types'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `<div class="story-row" style="align-items: stretch"><BaseStat v-for="variant in STAT_VARIANTS" :key="variant" v-bind="args" :variant="variant" :label="variant" /></div>`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Все варианты оформления. Размер из Controls применяется ко всем.' },
			source: storySource({ template, imports: ['BaseStat', 'STAT_VARIANTS'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseStat },
		setup: useStorySetup(args, { data: { STAT_VARIANTS } }),
		template,
	}),
}
