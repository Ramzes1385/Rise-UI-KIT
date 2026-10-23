import { expect } from 'storybook/test'
import type meta from '../../BaseHeatmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseHeatmap from '../../../ui/BaseHeatmap.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div style="display: flex; flex-direction: column; gap: 24px">
		<BaseHeatmap v-bind="args" label="По языку кита" :weeks="12" />
		<BaseHeatmap v-bind="args" label="С воскресенья" :weeks="12" :first-day-of-week="0" />
		<BaseHeatmap v-bind="args" label="С субботы" :weeks="12" :first-day-of-week="6" />
	</div>
`

export const FirstDayOfWeek: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Первый день недели (верхняя строка): по умолчанию — из языка кита (по-русски понедельник), проп `firstDayOfWeek` задаёт свой — 0 воскресенье … 6 суббота.',
			},
			source: storySource({ template, imports: ['BaseHeatmap'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseHeatmap },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('img', { name: /^По языку кита: всего/ })).toBeInTheDocument()
		await expect(canvas.getAllByText('вс').length).toBeGreaterThan(0)
	},
}
