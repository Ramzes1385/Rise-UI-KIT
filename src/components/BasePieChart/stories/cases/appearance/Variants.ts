import type meta from '../../BasePieChart.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePieChart from '../../../ui/BasePieChart.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { PIE_CHART_VARIANTS } from '../../../types/BasePieChart.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: '`donut` — кольцо с итогом в центре, `pie` — круг.' } },
		controls: { include: ['size', 'sizeScale'] },
	},
	render: args => ({
		components: { BasePieChart },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: PIE_CHART_VARIANTS }),
		template: `
			<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 32px">
				<BasePieChart v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" />
			</div>`,
	}),
}
