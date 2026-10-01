import type { Slots } from 'vue'
import { UI_FILTER } from '@/locales/messages'
import { describe, expect, it, vi } from 'vitest'
import { useTableToolbar } from '../useTableToolbar'
import type { TableColumn } from '@components/BaseTable/types/BaseTable.types'

type Flags = { search?: boolean; filters?: boolean; settings?: boolean; slots?: Slots }

function setup(flags: Flags = {}, columns: TableColumn[] = []) {
	const addFilter = vi.fn()
	const removeFilter = vi.fn()
	const api = useTableToolbar({
		filterableColumns: () => columns,
		hasSearch: () => !!flags.search,
		hasFilters: () => !!flags.filters,
		hasColumnSettings: () => !!flags.settings,
		slots: flags.slots ?? {},
		addFilter,
		removeFilter,
	})
	return { addFilter, removeFilter, ...api }
}

describe('useTableToolbar', () => {
	it('без поиска, фильтров, настроек и слотов тулбар скрыт', () => {
		expect(setup().showToolbar.value).toBe(false)
	})

	it.each<[string, Flags]>([
		['поиск', { search: true }],
		['фильтры', { filters: true }],
		['настройки колонок', { settings: true }],
		['слот toolbar-prepend', { slots: { 'toolbar-prepend': () => [] } }],
		['слот toolbar-append', { slots: { 'toolbar-append': () => [] } }],
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

	it('операторы фильтра начинаются с «Содержит» на текущем языке', () => {
		const { filterOperatorOptions } = setup()
		expect(filterOperatorOptions.value[0]).toEqual({ value: 'contains', label: UI_FILTER.CONTAINS })
		expect(filterOperatorOptions.value.map(option => option.value)).toEqual(['contains', 'eq', 'ne', 'gt', 'gte', 'lt', 'lte'])
	})

	it('выбор колонки и оператора меняет черновик фильтра, добавление передаёт его', () => {
		const ctx = setup({ filters: true })
		expect(ctx.filterOperator.value).toBe('contains')

		ctx.setFilterColumn('name')
		ctx.setFilterOperator('eq')
		ctx.filterValue.value = 'Анна'
		ctx.handleAddFilter()

		expect(ctx.getSelectValue('x')).toBe('x')
		expect(ctx.addFilter).toHaveBeenCalledWith(ctx.filterColumn, ctx.filterOperator, ctx.filterValue)
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
