import { expect, waitFor } from 'storybook/test'
import type meta from '../../../BaseTable.stories'
import BaseTable from '../../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import type { TableColumn, TableRow } from '../../../../types/BaseTable.types'

const SHIRTS = [
	{ id: 1, model: 'Футболка «Север»', size: 'L', stock: 12 },
	{ id: 2, model: 'Футболка «Юг»', size: 'XS', stock: 4 },
	{ id: 3, model: 'Худи «Запад»', size: 'XL', stock: 0 },
	{ id: 4, model: 'Худи «Восток»', size: 'S', stock: 9 },
	{ id: 5, model: 'Поло «Центр»', size: 'M', stock: 21 },
]

const SIZES = ['XS', 'S', 'M', 'L', 'XL']

const rows: TableRow[] = SHIRTS.map(item => ({ id: item.id, data: { ...item } }))

const columns: TableColumn[] = [
	{ key: 'model', label: 'Модель', isSortable: true, sortType: 'string' },
	{
		key: 'size',
		label: 'Размер',
		isSortable: true,
		sortCompare: (a, b) => SIZES.indexOf(String(a)) - SIZES.indexOf(String(b)),
	},
	{ key: 'stock', label: 'На складе', isSortable: true, sortType: 'number', align: 'right' },
]

const template = `
	<BaseTable v-bind="args" :columns="columns" :rows="rows" />
`

const script = [
	`const SIZES = ${literal(SIZES)}`,
	`const rows: TableRow[] = ${literal(SHIRTS)}.map(item => ({ id: item.id, data: { ...item } }))`,
	[
		'const columns: TableColumn[] = [',
		"\t{ key: 'model', label: 'Модель', isSortable: true, sortType: 'string' },",
		'\t{',
		"\t\tkey: 'size',",
		"\t\tlabel: 'Размер',",
		'\t\tisSortable: true,',
		'\t\tsortCompare: (a, b) => SIZES.indexOf(String(a)) - SIZES.indexOf(String(b)),',
		'\t},',
		"\t{ key: 'stock', label: 'На складе', isSortable: true, sortType: 'number', align: 'right' },",
		']',
	].join('\n'),
].join('\n\n')

function sizes(table: HTMLElement): string[] {
	return [...table.querySelectorAll('tbody tr')].map(row => row.querySelectorAll('td')[1]?.textContent?.trim() ?? '')
}

export const SortCompare: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Своя функция сортировки: `sortCompare(a, b, rows)` колонки получает значения ячеек и строки (`rows.a`, `rows.b`) и возвращает',
					'отрицательное число, нуль или положительное — как `comparator` в AG Grid. Направление применяет таблица. Здесь размеры',
					'идут по порядку «XS, S, M, L, XL», а не по алфавиту. `sortCompare` важнее `sortAccessor` и `sortType`; пустые',
					'значения в функцию тоже попадают, порядок для них задаёт она. Колонка по-прежнему должна быть `isSortable`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseTable', 'type TableColumn', 'type TableRow'],
				script,
				omit: ['columns', 'rows'],
			}),
		},
	},
	render: args => ({
		components: { BaseTable },
		setup: useStorySetup(args, { data: { columns, rows } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const table = canvas.getByRole('table')
		const sortBySize = canvas.getByRole('button', { name: 'Размер' })
		sortBySize.focus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(sizes(table)).toEqual(['XS', 'S', 'M', 'L', 'XL']))
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(sizes(table)).toEqual(['XL', 'L', 'M', 'S', 'XS']))
	},
}
