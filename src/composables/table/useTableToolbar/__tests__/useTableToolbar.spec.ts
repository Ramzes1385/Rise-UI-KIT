import { UI_FILTER } from '@/locales/messages'
import { describe, expect, it, vi } from 'vitest'
import { useTableToolbar } from '../useTableToolbar'
import type { TableColumn } from '@components/BaseTable/types/BaseTable.types'

type Flags = { search?: boolean; filters?: boolean; settings?: boolean }

function setup(flags: Flags = {}, columns: TableColumn[] = []) {
	const addFilter = vi.fn()
	const removeFilter = vi.fn()
	const api = useTableToolbar({
		filterableColumns: () => columns,
		hasSearch: () => !!flags.search,
		hasFilters: () => !!flags.filters,
		hasColumnSettings: () => !!flags.settings,
		addFilter,
		removeFilter,
	})
	return { addFilter, removeFilter, ...api }
}

describe('useTableToolbar', () => {
	it('без поиска, фильтров и настроек тулбар скрыт (слоты проверяет сама таблица при отрисовке)', () => {
		expect(setup().showToolbar.value).toBe(false)
	})

	it.each<[string, Flags]>([
		['поиск', { search: true }],
		['фильтры', { filters: true }],
		['настройки колонок', { settings: true }],
	])('тулбар показан, когда есть %s', (_, flags) => {
		expect(setup(flags).showToolbar.value).toBe(true)
	})

	it('варианты колонки фильтра — подписи фильтруемых колонок', () => {
		const { filterColumnOptions } = setup({}, [
			{ key: 'name', label: 'Имя' },
			{ key: 'age', label: 'Возраст' },
		])
		expect(filterColumnOptions.value).toEqual([
			{ value: 'name', label: 'Имя' },
			{ value: 'age', label: 'Возраст' },
		])
	})

	it('без выбранной колонки операторы текстовые и начинаются с «Содержит» на текущем языке', () => {
		const { filterOperatorOptions, filterKind } = setup()
		expect(filterKind.value).toBe('text')
		expect(filterOperatorOptions.value[0]).toEqual({ value: 'contains', label: UI_FILTER.CONTAINS })
		expect(filterOperatorOptions.value.map(option => option.value)).toEqual(['contains', 'eq', 'ne'])
	})

	describe('операторы и поля по типу колонки', () => {
		const columns: TableColumn[] = [
			{ key: 'name', label: 'Имя' },
			{ key: 'amount', label: 'Сумма', sortType: 'number' },
			{ key: 'date', label: 'Дата', sortType: 'date' },
			{ key: 'range', label: 'Диапазон', filterConfig: { type: 'range', placeholder: 'от — до' } },
			{ key: 'status', label: 'Статус', filterConfig: { type: 'multi-select', options: [{ value: 'new', label: 'Новый' }] } },
		]

		it('выбор колонки подставляет оператор и операторы типа, сбрасывает значения', () => {
			const ctx = setup({ filters: true }, columns)
			ctx.filterValue.value = 'x'
			ctx.filterValueTo.value = 'y'
			ctx.filterValues.value = ['z']
			ctx.setFilterColumn('amount')
			expect(ctx.filterKind.value).toBe('number')
			expect(ctx.filterOperator.value).toBe('eq')
			expect(ctx.filterOperatorOptions.value.map(option => option.value)).toContain('between')
			expect([ctx.filterValue.value, ctx.filterValueTo.value, ctx.filterValues.value]).toEqual(['', '', []])

			ctx.setFilterColumn('date')
			expect(ctx.filterKind.value).toBe('date')

			ctx.setFilterColumn('range')
			expect(ctx.filterOperator.value).toBe('between')
			expect(ctx.isRangeOperator.value).toBe(true)
			expect(ctx.filterPlaceholder.value).toBe('от — до')

			ctx.setFilterColumn('status')
			expect(ctx.filterOperator.value).toBe('in')
			expect(ctx.filterSelectOptions.value).toEqual([{ value: 'new', label: 'Новый' }])
			expect(ctx.filterPlaceholder.value).toBeUndefined()

			ctx.setFilterColumn('name')
			expect(ctx.filterOperator.value).toBe('contains')
			expect(ctx.filterSelectOptions.value).toEqual([])
		})

		it('смена оператора сбрасывает верхнюю границу, а переход на in — значение', () => {
			const ctx = setup({ filters: true }, columns)
			ctx.setFilterColumn('amount')
			ctx.setFilterOperator('between')
			ctx.filterValue.value = '1'
			ctx.filterValueTo.value = '5'
			ctx.setFilterOperator('gt')
			expect(ctx.filterValueTo.value).toBe('')
			expect(ctx.filterValue.value).toBe('1')
			ctx.setFilterOperator('in')
			expect(ctx.filterValue.value).toBe('')
		})

		it('canAddFilter: нужна колонка и полный набор значений оператора', () => {
			const ctx = setup({ filters: true }, columns)
			expect(ctx.canAddFilter.value).toBe(false)
			ctx.setFilterColumn('amount')
			expect(ctx.canAddFilter.value).toBe(false)
			ctx.filterValue.value = '10'
			expect(ctx.canAddFilter.value).toBe(true)
			ctx.setFilterOperator('between')
			expect(ctx.canAddFilter.value).toBe(false)
			ctx.filterValueTo.value = '20'
			expect(ctx.canAddFilter.value).toBe(true)
			ctx.filterValue.value = ''
			expect(ctx.canAddFilter.value).toBe(false)
			ctx.setFilterColumn('status')
			expect(ctx.canAddFilter.value).toBe(false)
			ctx.filterValues.value = ['new']
			expect(ctx.canAddFilter.value).toBe(true)
		})
	})

	it('выбор колонки и оператора меняет черновик фильтра, добавление передаёт его', () => {
		const ctx = setup({ filters: true })
		expect(ctx.filterOperator.value).toBe('contains')

		ctx.setFilterColumn('name')
		ctx.setFilterOperator('eq')
		ctx.filterValue.value = 'Анна'
		ctx.handleAddFilter()

		expect(ctx.getSelectValue('x')).toBe('x')
		expect(ctx.addFilter).toHaveBeenCalledWith({
			column: ctx.filterColumn,
			operator: ctx.filterOperator,
			value: ctx.filterValue,
			valueTo: ctx.filterValueTo,
			values: ctx.filterValues,
		})
		expect(ctx.filterColumn.value).toBe('name')
		expect(ctx.filterOperator.value).toBe('eq')
	})

	it('удаление фильтра передаёт его индекс, панель настроек закрыта по умолчанию', () => {
		const ctx = setup({ filters: true })
		ctx.handleRemoveFilter(2)
		expect(ctx.removeFilter).toHaveBeenCalledWith(2)
		expect(ctx.isSettingsOpen.value).toBe(false)
	})
})
