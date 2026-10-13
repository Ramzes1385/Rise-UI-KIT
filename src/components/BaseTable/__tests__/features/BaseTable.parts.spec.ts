import '@testing-library/jest-dom/vitest'
import { mount } from '@vue/test-utils'
import BaseTable from '../../ui/BaseTable.vue'
import { BaseInput } from '@components/BaseInput'
import { BaseSelect } from '@components/BaseSelect'
import BaseTableToolbar from '../../ui/toolbar/BaseTableToolbar.vue'
import type { TableColumn, TableRow } from '../../types/BaseTable.types'
import type { BaseTableToolbarProps } from '../../types/toolbar/BaseTableToolbar.types'

const COLUMNS: TableColumn[] = [
	{ key: 'name', label: 'Имя', isSortable: true, isResizable: true, width: '200px' },
	{ key: 'city', label: 'Город' },
]

const ROWS: TableRow[] = Array.from({ length: 5 }, (_, index) => ({ id: index + 1, data: { name: `Имя ${index + 1}`, city: 'Тула' } }))

const TOOLBAR_PROPS: BaseTableToolbarProps = {
	showToolbar: true,
	hasSearch: false,
	hasFilters: true,
	hasColumnSettings: false,
	searchQuery: '',
	filterColumn: 'city',
	filterOperator: 'eq',
	filterValue: '',
	filterColumnOptions: [{ value: 'city', label: 'Город' }],
	filterOperatorOptions: [
		{ value: 'eq', label: 'равно' },
		{ value: 'ne', label: 'не равно' },
	],
	activeFilters: [],
	columns: COLUMNS,
	isSettingsOpen: false,
	exportItems: [],
	isExportOpen: false,
	sizeScale: 100,
	getFilterLabel: () => '',
}

describe('BaseTable: события частей', () => {
	it('фильтры панели: условие, значение и Enter в поле значения', async () => {
		const wrapper = mount(BaseTableToolbar, { props: TOOLBAR_PROPS })
		const [, operator] = wrapper.findAllComponents(BaseSelect)
		const value = wrapper.findComponent(BaseInput)

		operator.vm.$emit('update:modelValue', 'ne')
		value.vm.$emit('update:modelValue', 'Тула')
		value.vm.$emit('keydown', new KeyboardEvent('keydown', { key: 'Enter' }))

		expect(wrapper.emitted('update:filter-operator')).toEqual([['ne']])
		expect(wrapper.emitted('update:filter-value')).toEqual([['Тула']])
		expect(wrapper.emitted('add-filter')).toHaveLength(1)
	})

	it('щелчок по ручке ширины не сортирует колонку', async () => {
		const wrapper = mount(BaseTable, { props: { columns: COLUMNS, rows: ROWS, behavior: { resizable: true } } })

		await wrapper.find('.base-table__resizer').trigger('click')

		expect(wrapper.emitted('sort')).toBeUndefined()
	})

	it('подгрузка прокруткой ждёт конца текущей загрузки', async () => {
		const wrapper = mount(BaseTable, { props: { columns: COLUMNS, rows: ROWS, loadMode: 'infinite', pageSize: 2, isLoading: true } })

		await wrapper.find('.base-table__wrapper').trigger('scroll')
		expect(wrapper.emitted('load-more')).toBeUndefined()

		await wrapper.setProps({ isLoading: false })
		await wrapper.find('.base-table__wrapper').trigger('scroll')
		expect(wrapper.emitted('load-more')).toHaveLength(1)
	})
})
