import { expect } from 'storybook/test'
import type meta from '../../BaseTable.stories'
import BaseTable from '../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import { COMPACT_COLUMNS, toRows, ORDERS, tableScript } from '../../shared'

const columns = COMPACT_COLUMNS

const rows = toRows(ORDERS.slice(0, 3))

const template = `
	<div class="story-stack">
		<span class="story-label">padding: 6 → 6px 12px</span>
		<BaseTable v-bind="args" :columns="columns" :rows="rows" :padding="6" :behavior="{ selectable: true }" />
		<span class="story-label">padding: { x: 24, y: 16 }</span>
		<BaseTable v-bind="args" :columns="columns" :rows="rows" :padding="{ x: 24, y: 16 }" />
	</div>
`

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
			source: storySource({ template, imports: ['BaseTable', 'type TableColumn'], script: tableScript({ columns }, { rows }) }),
		},
	},
	render: args => ({
		components: { BaseTable },
		setup: useStorySetup(args, { data: { columns, rows } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [compact, spacious] = canvasElement.querySelectorAll<HTMLElement>('.base-table')
		await expect(compact.style.getPropertyValue('--tbl-pad-top')).toBe('6px')
		await expect(compact.style.getPropertyValue('--tbl-pad-left')).toBe('12px')
		await expect(spacious.style.getPropertyValue('--tbl-pad-left')).toBe('24px')
	},
}
