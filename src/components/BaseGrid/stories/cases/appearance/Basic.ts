import { expect } from 'storybook/test'
import type meta from '../../BaseGrid.stories'
import BaseGrid from '../../../ui/BaseGrid.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseGrid v-bind="args" :cols="4">
		<div v-for="n in 8" :key="n" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">Карточка {{ n }}</div>
	</BaseGrid>
`

export const Basic: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['gap', 'rowGap', 'sizeScale'] },
		docs: {
			description: {
				story: 'Простая сетка из четырёх колонок: обычные элементы без `BaseGridItem` занимают по одной колонке и переходят на следующую строку сами.',
			},
			source: storySource({ template, imports: ['BaseGrid'], omit: ['cols'] }),
		},
	},
	render: args => ({
		components: { BaseGrid },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvasElement }) => {
		const grid = canvasElement.querySelector('.base-grid') as HTMLElement
		await expect(getComputedStyle(grid).gridTemplateColumns.split(' ')).toHaveLength(4)
		const cells = [...grid.children].map(cell => cell.getBoundingClientRect())
		await expect(cells[3].top).toBe(cells[0].top)
		await expect(cells[4].top).toBeGreaterThan(cells[0].top)
		await expect(cells[4].left).toBe(cells[0].left)
	},
}
