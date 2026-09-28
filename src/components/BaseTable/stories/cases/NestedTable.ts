import type meta from '../BaseTable.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type { NestedTableConfig } from '../../types/BaseTable.types'
import { COMPACT_COLUMNS, toRows, ORDERS, formatRub } from '../shared'

const NESTED_CONFIG: NestedTableConfig = {
	title: 'Состав заказа',
	childrenKey: 'children',
	columns: [
		{ key: 'product', label: 'Товар' },
		{ key: 'quantity', label: 'Кол-во', align: 'right' },
		{ key: 'price', label: 'Цена', align: 'right', formatter: formatRub },
	],
}

export const NestedTable: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Вложенная таблица: с `nestedConfig` дочерние строки (`children`) показываются отдельной таблицей со своими колонками',
					'и заголовком `title`. Строка с `isExpanded` раскрыта сразу.',
				].join('\n'),
			},
		},
	},
	args: {
		columns: COMPACT_COLUMNS,
		nestedConfig: NESTED_CONFIG,
		rows: [
			{
				...toRows([ORDERS[0]])[0],
				isExpanded: true,
				children: [
					{ id: 'p1', data: { product: 'Кофеварка капельная', quantity: 1, price: 8990 } },
					{ id: 'p2', data: { product: 'Фильтры бумажные, 100 шт.', quantity: 2, price: 1750 } },
				],
			},
			{
				...toRows([ORDERS[1]])[0],
				children: [{ id: 'p3', data: { product: 'Кружка керамическая', quantity: 3, price: 1050 } }],
			},
		],
	},
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getAllByRole('table')).toHaveLength(2)
		await userEvent.click(canvas.getByRole('button', { name: 'Развернуть строку' }))
		await waitFor(() => expect(canvas.getAllByRole('table')).toHaveLength(3))
		await waitFor(() => expect(canvas.getByRole('cell', { name: 'Кружка керамическая' })).toBeVisible())
	},
}
