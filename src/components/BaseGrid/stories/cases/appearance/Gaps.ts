import { expect } from 'storybook/test'
import type meta from '../../BaseGrid.stories'
import BaseGrid from '../../../ui/BaseGrid.vue'
import { STACK_GAPS } from '@components/BaseStack'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<div v-for="gap in STACK_GAPS" :key="gap">
			<span class="story-label">gap: {{ gap }}</span>
			<BaseGrid v-bind="args" :cols="4" :gap="gap">
				<div v-for="n in 8" :key="n" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">{{ n }}</div>
			</BaseGrid>
		</div>
		<div>
			<span class="story-label">gap: xs, rowGap: xl</span>
			<BaseGrid v-bind="args" :cols="4" gap="xs" row-gap="xl">
				<div v-for="n in 8" :key="n" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">{{ n }}</div>
			</BaseGrid>
		</div>
	</div>
`

export const Gaps: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: {
				story: 'Промежутки: `gap` задаёт расстояние и между колонками, и между строками (`none`…`xl`), `rowGap` — отдельно между строками. Последняя сетка: колонки близко (`xs`), строки далеко (`xl`).',
			},
			source: storySource({ template, imports: ['BaseGrid', 'STACK_GAPS'], omit: ['cols', 'gap', 'rowGap'] }),
		},
	},
	render: args => ({
		components: { BaseGrid },
		setup: useStorySetup(args, { data: { STACK_GAPS } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const grids = [...canvasElement.querySelectorAll<HTMLElement>('.base-grid')]
		await expect(grids).toHaveLength(STACK_GAPS.length + 1)
		await expect(getComputedStyle(grids[0]).columnGap).toBe('0px')
		await expect(getComputedStyle(grids[0]).rowGap).toBe('0px')
		const mixed = getComputedStyle(grids[STACK_GAPS.length])
		await expect(parseFloat(mixed.rowGap)).toBeGreaterThan(parseFloat(mixed.columnGap))
		if (!isStoryBranded())
			await expect(grids.map(grid => getComputedStyle(grid).columnGap)).toEqual(['0px', '4px', '8px', '16px', '24px', '32px', '4px'])
		if (!isStoryBranded()) await expect(mixed.rowGap).toBe('32px')
	},
}
