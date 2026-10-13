import type meta from '../../BaseTable.stories'
import BaseTable from '../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import type { TableColumn } from '../../../types/BaseTable.types'
import { ALL_ROWS, COLUMNS, bodyRows, tableScript } from '../../shared'
import { STORY_WAIT_TIMEOUT, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseTable v-bind="args" :columns="columns" />
`

const STATUS_OPTIONS = ['Доставлен', 'В пути', 'Оплачен', 'Отменён'].map(status => ({ value: status, label: status }))

const columns: TableColumn[] = COLUMNS.map(column =>
	column.key === 'status' ? { ...column, filterConfig: { type: 'multi-select', options: STATUS_OPTIONS } } : column,
)

export const FilterOperators: StoryObj<typeof meta> = {
	args: { rows: ALL_ROWS, features: { filters: true }, behavior: {} },
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'features'] },
		docs: {
			description: {
				story: [
					'Операторы фильтра зависят от типа колонки: у текста — «Содержит», «=», «≠»; у чисел (`sortType: "number"`) — сравнения и',
					'«Между»; у дат (`sortType: "date"`) — «Раньше», «Позже», «Не раньше», «Не позже» и «Между» с выбором в календаре,',
					'даты сравниваются по дням; у колонки с `filterConfig` — поле значения по `type`: `select`, `multi-select` (оператор',
					'«Один из», `values`), `range` (диапазон «от — до»), `date`. «Между» включает обе границы и пишет `valueTo` в событие `filter`.',
					'Кнопка «Добавить» недоступна, пока значение не полное, но остаётся в обходе Tab.',
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
	render: args => ({
		components: { BaseTable },
		setup: useStorySetup(args, { data: { columns } }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const choose = async (field: string, option: string): Promise<void> => {
			await userEvent.click(canvas.getByRole('combobox', { name: field }))
			await userEvent.click(await screen.findByRole('option', { name: option }, { timeout: STORY_WAIT_TIMEOUT }))
		}
		const table = canvas.getByRole('table')
		const add = canvas.getByRole('button', { name: 'Добавить' })
		await expect(add).toHaveAttribute('aria-disabled', 'true')

		await choose('Колонка фильтра', 'Сумма')
		await choose('Условие фильтра', 'Между')
		await userEvent.type(canvas.getByRole('spinbutton', { name: 'Значение фильтра от' }), '5000')
		await expect(add).toHaveAttribute('aria-disabled', 'true')
		await userEvent.type(canvas.getByRole('spinbutton', { name: 'Значение фильтра до' }), '20000')
		await expect(add).not.toHaveAttribute('aria-disabled', 'true')
		await userEvent.click(add)
		await waitFor(() => expect(bodyRows(table)).toHaveLength(6))
		await expect(canvas.getByText(/Сумма: 5000 – 20000/)).toBeInTheDocument()
		await expect(args.onFilter).toHaveBeenLastCalledWith([{ key: 'total', operator: 'between', value: '5000', valueTo: '20000' }])

		await choose('Колонка фильтра', 'Статус')
		await expect(canvas.getByRole('combobox', { name: 'Условие фильтра' })).toHaveTextContent('Один из')
		await userEvent.click(canvas.getByRole('combobox', { name: 'Значение фильтра' }))
		await userEvent.click(await screen.findByRole('option', { name: 'Доставлен' }, { timeout: STORY_WAIT_TIMEOUT }))
		await userEvent.click(screen.getByRole('option', { name: 'Оплачен' }))
		await userEvent.keyboard('{Escape}')
		await userEvent.click(add)
		await waitFor(() => expect(bodyRows(table)).toHaveLength(4))
		await expect(args.onFilter).toHaveBeenLastCalledWith([
			{ key: 'total', operator: 'between', value: '5000', valueTo: '20000' },
			{ key: 'status', operator: 'in', value: 'Доставлен, Оплачен', values: ['Доставлен', 'Оплачен'] },
		])
	},
}
