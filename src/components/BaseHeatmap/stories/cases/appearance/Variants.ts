import type meta from '../../BaseHeatmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseHeatmap from '../../../ui/BaseHeatmap.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Скруглённые и квадратные ячейки, свой цвет через `markColor`, полгода вместо года.' } },
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseHeatmap },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<div style="display: flex; flex-direction: column; gap: 24px">
				<BaseHeatmap v-bind="props" variant="square" :weeks="26" />
				<BaseHeatmap v-bind="props" :weeks="26" mark-color="var(--rise-chart-1)" />
			</div>`,
	}),
}
