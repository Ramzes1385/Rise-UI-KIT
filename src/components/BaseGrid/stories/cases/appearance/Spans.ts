import { expect } from 'storybook/test'
import type meta from '../../BaseGrid.stories'
import BaseGrid from '../../../ui/BaseGrid.vue'
import { BaseGridItem } from '@components/BaseGrid'
import type { StoryObj } from '@storybook/vue3-vite'
import { inlineStart, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<div>
			<span class="story-label">span: 3, 6, 3</span>
			<BaseGrid v-bind="args" :cols="12">
				<BaseGridItem :span="3" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">3</BaseGridItem>
				<BaseGridItem :span="6" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">6</BaseGridItem>
				<BaseGridItem :span="3" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">3</BaseGridItem>
			</BaseGrid>
		</div>
		<div>
			<span class="story-label">offset: 6 (колонка начала — седьмая)</span>
			<BaseGrid v-bind="args" :cols="12">
				<BaseGridItem :span="6" :offset="6" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">span 6, offset 6</BaseGridItem>
			</BaseGrid>
		</div>
		<div>
			<span class="story-label">span: 'full' в сетке из четырёх колонок</span>
			<BaseGrid v-bind="args" :cols="4">
				<BaseGridItem style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">1</BaseGridItem>
				<BaseGridItem style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">2</BaseGridItem>
				<BaseGridItem span="full" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">full</BaseGridItem>
				<BaseGridItem style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">3</BaseGridItem>
			</BaseGrid>
		</div>
		<div>
			<span class="story-label">order: исходно А, Б, В — на экране Б, В, А</span>
			<BaseGrid v-bind="args" :cols="3">
				<BaseGridItem :order="3" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">А (order 3)</BaseGridItem>
				<BaseGridItem :order="1" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">Б (order 1)</BaseGridItem>
				<BaseGridItem :order="2" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">В (order 2)</BaseGridItem>
			</BaseGrid>
		</div>
	</div>
`

export const Spans: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['gap', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Ячейки `BaseGridItem`: `span` — сколько колонок занять (число или `full` — вся строка), `offset` — колонка начала минус один',
					'(`offset` 6 ставит ячейку в седьмую колонку; это абсолютная колонка, а не сдвиг от соседа), `order` — порядок показа.',
					'`order` меняет только вид: для Tab и скринридера остаётся исходный порядок, поэтому не переставляйте им смысловые блоки.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseGrid', 'BaseGridItem'], omit: ['cols'] }),
		},
	},
	render: args => ({
		components: { BaseGrid, BaseGridItem },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [spans, offset, full, order] = [...canvasElement.querySelectorAll<HTMLElement>('.base-grid')]
		const widths = [...spans.children].map(cell => cell.getBoundingClientRect().width)
		await expect(widths[1]).toBeGreaterThan(widths[0] * 1.9)
		await expect(Math.round(widths[0])).toBe(Math.round(widths[2]))

		const gap = parseFloat(getComputedStyle(offset).columnGap)
		const gridBox = offset.getBoundingClientRect()
		const columnWidth = (gridBox.width - 11 * gap) / 12
		const shifted = offset.children[0].getBoundingClientRect()
		await expect(Math.abs(inlineStart(shifted) - (inlineStart(gridBox) + 6 * (columnWidth + gap)))).toBeLessThan(2)

		const fullBox = full.children[2].getBoundingClientRect()
		await expect(Math.round(fullBox.width)).toBe(Math.round(full.getBoundingClientRect().width))
		await expect(fullBox.top).toBeGreaterThan(full.children[0].getBoundingClientRect().top)

		const [first, second, third] = [...order.children].map(cell => inlineStart(cell.getBoundingClientRect()))
		await expect(second).toBeLessThan(third)
		await expect(third).toBeLessThan(first)
	},
}
