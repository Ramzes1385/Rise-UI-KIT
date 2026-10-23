import { fn } from 'storybook/test'
import type BaseTable from '../ui/BaseTable.vue'
import type { Meta } from '@storybook/vue3-vite'
import { COLUMNS, toRows, ORDERS } from './shared'

const ROWS = toRows(ORDERS.slice(0, 5))

export const args = {
	columns: COLUMNS,
	rows: ROWS,
	variant: 'default',
	sizeScale: 100,
	emptyText: 'Нет данных',
	isLoading: false,
	height: '',
	features: {},
	behavior: {},
	pageSize: 0,
	pageSizeOptions: [],
	loadMode: 'pagination',
	searchDebounce: 300,
	onSort: fn(),
	onFilter: fn(),
	onSearch: fn(),
	onSelect: fn(),
	onExpand: fn(),
	'onRow-click': fn(),
	'onPage-change': fn(),
	'onPage-size-change': fn(),
	'onLoad-more': fn(),
	'onColumn-resize': fn(),
	'onColumns-change': fn(),
	onExport: fn(),
} satisfies Meta<typeof BaseTable>['args']
