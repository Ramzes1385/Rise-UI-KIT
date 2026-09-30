import type meta from '../../BaseHeatmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseHeatmap from '../../../ui/BaseHeatmap.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div style="display: flex; flex-direction: column; gap: 24px">
		<BaseHeatmap v-bind="args" variant="square" :weeks="26" />
		<BaseHeatmap v-bind="args" :weeks="26" mark-color="var(--rise-chart-1)" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Скруглённые и квадратные ячейки, свой цвет через `markColor`, полгода вместо года.' },
			source: storySource({ template, imports: ['BaseHeatmap'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseHeatmap },
		setup: useStorySetup(args),
		template,
	}),
}
