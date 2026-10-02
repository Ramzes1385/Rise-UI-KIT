import type meta from '../BaseChart.stories'
import BaseChart from '../../ui/BaseChart.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { CHART_VARIANTS } from '../../types/BaseChart.types'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `<div class="story-row"><BaseChart v-for="variant in CHART_VARIANTS" :key="variant" v-bind="args" :variant="variant" :label="variant" /></div>`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Все варианты оформления. Размер из Controls применяется ко всем.' },
			source: storySource({ template, imports: ['BaseChart', 'CHART_VARIANTS'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseChart },
		setup: useStorySetup(args, { data: { CHART_VARIANTS } }),
		template,
	}),
}
