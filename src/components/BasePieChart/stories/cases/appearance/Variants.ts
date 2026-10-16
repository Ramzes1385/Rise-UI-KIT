import type meta from '../../BasePieChart.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePieChart from '../../../ui/BasePieChart.vue'
import { PIE_CHART_VARIANTS } from '../../../types/BasePieChart.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = PIE_CHART_VARIANTS

const template = `
	<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 380px), 1fr)); gap: 32px">
		<BasePieChart v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: '`donut` — кольцо с итогом в центре, `pie` — круг.' },
			source: storySource({
				template,
				imports: ['BasePieChart'],
				script: `const variants = ${literal(variants)}`,
				omit: ['variant'],
			}),
		},
		controls: { include: ['size', 'sizeScale'] },
	},
	render: args => ({
		components: { BasePieChart },
		setup: useStorySetup(args, { data: { variants } }),
		template,
	}),
}
