import type meta from '../../BaseTable.stories'
import { waitFor, expect } from 'storybook/test'
import BaseTable from '../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import type { TableColumn } from '../../../types/BaseTable.types'
import { ALL_ROWS, formatDate, formatRub, tableScript } from '../../shared'
import { inlineDelta, inlineEnd, inlineStart, storySource, useStorySetup } from '@/stories/helpers'

const columns: TableColumn[] = [
	{ key: 'customer', label: 'Покупатель', width: '180px', isSticky: 'left' },
	{ key: 'number', label: 'Заказ', width: '120px' },
	{ key: 'city', label: 'Город', width: '180px' },
	{ key: 'status', label: 'Статус', width: '140px' },
	{ key: 'date', label: 'Дата', width: '140px', formatter: formatDate },
	{ key: 'progress', label: 'Сборка, %', width: '140px', align: 'right' },
	{ key: 'total', label: 'Сумма', width: '140px', align: 'right', formatter: formatRub, isSticky: 'right' },
]

const template = `
	<div style="max-width: 720px;"><BaseTable v-bind="args" :columns="columns" /></div>
`

export const StickyHeader: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					"Закреплённые шапка и колонки: `height` ограничивает высоту — строки прокручиваются под шапкой; `isSticky: 'left'`",
					"и `'right'` закрепляют колонки при горизонтальной прокрутке широкой таблицы. Прокручиваемая область получает",
					'фокус с клавиатуры (Tab), её можно прокрутить стрелками. Колонка выбора закрепляется вместе с колонками слева,',
					'а закреплённые колонки встают за ней и не перекрывают чекбоксы.',
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
		rows: ALL_ROWS,
		columns,
		behavior: { selectable: true },
	},
	render: args => ({
		components: { BaseTable },
		setup: useStorySetup(args, { data: { columns: args.columns }, slots: ['default', 'columns'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const table = canvas.getByRole('table')
		const scroller = table.parentElement as HTMLElement
		await waitFor(() => expect(scroller).toHaveAttribute('tabindex', '0'))
		scroller.scrollTop = 120
		const header = canvas.getByRole('columnheader', { name: 'Заказ' })
		await waitFor(() => expect(Math.round(header.getBoundingClientRect().top)).toBe(Math.round(scroller.getBoundingClientRect().top)))

		scroller.scrollLeft = inlineDelta(300)
		const checkCell = canvas.getByRole('checkbox', { name: 'Выбрать все строки' }).closest('th') as HTMLElement
		const customer = canvas.getByRole('columnheader', { name: 'Покупатель' })
		await waitFor(() =>
			expect(Math.round(inlineStart(checkCell.getBoundingClientRect()))).toBe(
				Math.round(inlineStart(scroller.getBoundingClientRect())),
			),
		)
		await expect(Math.round(inlineStart(customer.getBoundingClientRect()))).toBe(
			Math.round(inlineEnd(checkCell.getBoundingClientRect())),
		)
	},
}
