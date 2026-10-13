import { expect } from 'storybook/test'
import type meta from '../../BaseGrid.stories'
import BaseGrid from '../../../ui/BaseGrid.vue'
import { BaseGridItem } from '@components/BaseGrid'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<div>
			<span class="story-label">cols: { base: 1, sm: 2, md: 3, lg: 4, xl: 6 }</span>
			<BaseGrid v-bind="args" :cols="{ base: 1, sm: 2, md: 3, lg: 4, xl: 6 }">
				<div v-for="n in 12" :key="n" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">Карточка {{ n }}</div>
			</BaseGrid>
		</div>
		<div>
			<span class="story-label">span: { base: 'full', md: 6, lg: 4 }</span>
			<BaseGrid v-bind="args">
				<BaseGridItem v-for="n in 6" :key="n" :span="{ base: 'full', md: 6, lg: 4 }" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">Блок {{ n }}</BaseGridItem>
			</BaseGrid>
		</div>
	</div>
`

const COLUMNS_FROM_WIDTH = [
	[1440, 6],
	[1024, 4],
	[768, 3],
	[480, 2],
] as const

const SPAN_FROM_WIDTH = [
	[1024, 4],
	[768, 6],
] as const

const stepValue = (table: readonly (readonly [number, number])[], fallback: number): number =>
	table.find(([min]) => window.innerWidth >= min)?.[1] ?? fallback

export const Responsive: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['gap', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Адаптивная сетка: `cols` и `span` принимают объект по брейкпоинтам `{ base, sm, md, lg, xl }`. Значение действует от своего брейкпоинта',
					'и выше, пропущенный шаг наследует меньший: `base` — меньше 480px, `sm` — от 480px, `md` — от 768px, `lg` — от 1024px, `xl` — от 1440px.',
					'Брейкпоинты считаются по ширине окна, а не контейнера: меняйте ширину окна или панель «Viewport» Storybook.',
					'Сверху сетка карточек 1 → 2 → 3 → 4 → 6 колонок, снизу ячейки на всю строку, затем по две и по три в ряд.',
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
		const [cards, blocks] = [...canvasElement.querySelectorAll<HTMLElement>('.base-grid')]
		await expect(getComputedStyle(cards).gridTemplateColumns.split(' ')).toHaveLength(stepValue(COLUMNS_FROM_WIDTH, 1))

		const gap = parseFloat(getComputedStyle(blocks).columnGap)
		const width = blocks.getBoundingClientRect().width
		const span = window.innerWidth >= 768 ? stepValue(SPAN_FROM_WIDTH, 12) : 12
		const columnWidth = (width - 11 * gap) / 12
		const expected = span * columnWidth + (span - 1) * gap
		await expect(Math.abs(blocks.children[0].getBoundingClientRect().width - expected)).toBeLessThan(2)
	},
}
