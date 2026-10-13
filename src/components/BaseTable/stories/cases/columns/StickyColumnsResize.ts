import type meta from '../../BaseTable.stories'
import { waitFor, expect } from 'storybook/test'
import BaseTable from '../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import type { TableColumn } from '../../../types/BaseTable.types'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'
import { ALL_ROWS, formatDate, formatRub, tableScript } from '../../shared'

const columns: TableColumn[] = [
	{ key: 'number', label: 'Заказ', width: '120px', isSticky: 'left' },
	{ key: 'customer', label: 'Покупатель', width: '180px', isSticky: 'left' },
	{ key: 'city', label: 'Город', width: '180px' },
	{ key: 'status', label: 'Статус', width: '140px' },
	{ key: 'date', label: 'Дата', width: '140px', formatter: formatDate },
	{ key: 'progress', label: 'Сборка, %', width: '140px', align: 'right' },
	{ key: 'total', label: 'Сумма', width: '140px', align: 'right', formatter: formatRub, isSticky: 'right' },
]

const template = `
	<div style="max-width: 720px;"><BaseTable v-bind="args" :columns="columns" /></div>
`

export const StickyColumnsResize: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Закреплённые колонки и ресайз: смещение каждой закреплённой колонки считается по фактической ширине предыдущих',
					'(колонка выбора, затем закреплённые слева), поэтому после изменения ширины первой закреплённой колонки вторая',
					'встаёт вплотную к ней и не налезает. Ширину меняет ручка (мышь, касание) или стрелки на ручке `role="separator"`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseTable', 'type TableColumn'],
				script: tableScript({ columns }),
				omit: ['columns'],
			}),
		},
	},
	args: {
		height: '260px',
		rows: ALL_ROWS.slice(0, 6),
		columns,
		behavior: { selectable: true, resizable: true },
	},
	render: args => ({
		components: { BaseTable },
		setup: useStorySetup(args, { data: { columns: args.columns }, slots: ['default', 'columns'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const first = canvas.getByRole('columnheader', { name: 'Заказ' })
		const second = canvas.getByRole('columnheader', { name: 'Покупатель' })
		const leftOfSecond = (): number => Math.round(parseFloat(second.style.left))
		await waitFor(() => expect(leftOfSecond()).toBeGreaterThan(0))
		const before = leftOfSecond()
		const widthBefore = Math.round(first.getBoundingClientRect().width)

		await tabTo(canvas.getByRole('separator', { name: 'Ширина колонки: Заказ' }), userEvent)
		await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}')
		await waitFor(() => expect(Math.round(first.getBoundingClientRect().width)).toBe(widthBefore + 30))
		await waitFor(() => expect(leftOfSecond()).toBe(before + 30))
		await expect(Math.round(second.getBoundingClientRect().left)).toBe(Math.round(first.getBoundingClientRect().right))

		const scroller = canvas.getByRole('table').parentElement as HTMLElement
		scroller.scrollLeft = 300
		await waitFor(() => expect(Math.round(second.getBoundingClientRect().left)).toBe(Math.round(first.getBoundingClientRect().right)))
	},
}
