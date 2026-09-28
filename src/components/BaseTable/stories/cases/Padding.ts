import { expect } from 'storybook/test'
import type meta from '../BaseTable.stories'
import BaseTable from '../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { COMPACT_COLUMNS, toRows, ORDERS } from '../shared'

export const Padding: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Отступы ячеек `padding`: число — Y = n, X = 2n (6 → 6px 12px, плотная таблица); объект `{ x, y }` задаёт оси напрямую.',
					'Без `padding` отступы 12px 16px из стилей. Отступы шапки и служебных колонок меняются вместе с ячейками.',
				].join('\n'),
			},
			source: {
				code: [
					'<BaseTable :columns="columns" :rows="rows" :padding="6" />',
					'<BaseTable :columns="columns" :rows="rows" :padding="{ x: 24, y: 16 }" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseTable },
		setup: () => ({ props: useArgsWithoutSlots(args), columns: COMPACT_COLUMNS, rows: toRows(ORDERS.slice(0, 3)) }),
		template: `
			<div class="story-stack">
				<span class="story-label">padding: 6 → 6px 12px</span>
				<BaseTable v-bind="props" :columns="columns" :rows="rows" :padding="6" :behavior="{ selectable: true }" />
				<span class="story-label">padding: { x: 24, y: 16 }</span>
				<BaseTable v-bind="props" :columns="columns" :rows="rows" :padding="{ x: 24, y: 16 }" />
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const [compact, spacious] = canvasElement.querySelectorAll<HTMLElement>('.base-table')
		await expect(compact.style.getPropertyValue('--tbl-pad-top')).toBe('6px')
		await expect(compact.style.getPropertyValue('--tbl-pad-left')).toBe('12px')
		await expect(spacious.style.getPropertyValue('--tbl-pad-left')).toBe('24px')
	},
}
