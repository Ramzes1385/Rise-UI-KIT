import type { Slots } from 'vue'
import { mount } from '@vue/test-utils'
import { useTableComposition } from '../useTableComposition'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, nextTick, ref } from 'vue'
import type { BaseTableEmits, TableColumn, TableRow } from '@components/BaseTable/types/BaseTable.types'

type Options = {
	loadMode?: string
	pageSize?: number
	isLoading?: boolean
	hasSearch?: boolean
	slots?: Slots
}

const COLUMNS: TableColumn[] = [
	{ key: 'name', label: 'Имя' },
	{ key: 'age', label: 'Возраст' },
]

const ROWS: TableRow[] = Array.from({ length: 5 }, (_, index) => ({
	id: index + 1,
	data: { name: `Строка ${index + 1}`, age: 20 + index },
}))

function setup(opts: Options = {}) {
	const emit = vi.fn()
	const isLoading = ref(opts.isLoading ?? false)
	let api!: ReturnType<typeof useTableComposition>
	const wrapper = mount(
		defineComponent({
			setup() {
				api = useTableComposition({
					rows: computed(() => ROWS),
					columns: computed(() => COLUMNS),
					loadMode: computed(() => opts.loadMode ?? 'pagination'),
					pageSize: computed(() => opts.pageSize ?? 2),
					isMultiSort: computed(() => false),
					searchDebounce: computed(() => 0),
					isResizable: computed(() => true),
					hasRowNumber: computed(() => true),
					isSelectable: computed(() => true),
					hasSearch: computed(() => opts.hasSearch ?? true),
					hasFilters: computed(() => false),
					hasColumnSettings: computed(() => false),
					isLoading: computed(() => isLoading.value),
					pageSizeOptions: computed(() => [10, 25]),
					infiniteScrollThreshold: 50,
					emit: emit as unknown as BaseTableEmits,
					slots: opts.slots ?? {},
				})
				return () => null
			},
		}),
	)
	return { api, emit, wrapper, isLoading }
}

function scrollEvent(metrics: { scrollTop: number; scrollHeight: number; clientHeight: number }): Event {
	const target = document.createElement('div')
	for (const [key, value] of Object.entries(metrics)) Object.defineProperty(target, key, { value })
	return { target } as unknown as Event
}

describe('useTableComposition', () => {
	it('собирает колонки, строки страницы и тулбар', () => {
		const { api, wrapper } = setup()

		expect(api.visibleColumns.value.map(column => column.key)).toEqual(['name', 'age'])
		expect(api.displayedRows.value.map(row => row.id)).toEqual([1, 2])
		expect(api.totalPages.value).toBe(3)
		expect(api.showToolbar.value).toBe(true)
		expect(api.totalCols.value).toBe(4)
		expect(api.skeletonRows.value).toBe(2)
		expect(api.useFixedLayout.value).toBe(true)
		expect(api.isColumnResizable(COLUMNS[0])).toBe(true)
		wrapper.unmount()
	})

	it('варианты размера страницы — строки, информация о странице — диапазон строк', () => {
		const { api, wrapper } = setup()

		expect(api.pageSizeSelectOptions.value).toEqual([
			{ value: '10', label: '10' },
			{ value: '25', label: '25' },
		])
		expect(api.paginationInfo.value).toMatch(/1.*2.*5/)
		wrapper.unmount()
	})

	it('смена страницы сообщает page-change и сдвигает номера строк', async () => {
		const { api, emit, wrapper } = setup()
		expect(api.getRowNumber(0)).toBe(1)

		api.currentPage.value = 2
		await nextTick()

		expect(emit).toHaveBeenCalledWith('page-change', 2)
		expect(api.getRowNumber(0)).toBe(3)
		wrapper.unmount()
	})

	it('выбор строки и всех строк сообщает select', () => {
		const { api, emit, wrapper } = setup()

		api.toggleRow(ROWS[0])
		expect(emit).toHaveBeenLastCalledWith('select', [ROWS[0]])
		expect(api.isSelected(ROWS[0])).toBe(true)

		api.toggleAll()
		expect(emit).toHaveBeenLastCalledWith('select', ROWS)
		expect(api.isAllSelected.value).toBe(true)
		wrapper.unmount()
	})

	it('«Загрузить ещё» догружает строки и сообщает load-more', () => {
		const { api, emit, wrapper } = setup({ loadMode: 'button' })
		expect(api.displayedRows.value).toHaveLength(2)

		api.handleLoadMore()

		expect(api.displayedRows.value).toHaveLength(4)
		expect(emit).toHaveBeenCalledWith('load-more')
		wrapper.unmount()
	})

	it('бесконечная прокрутка догружает у нижнего края', () => {
		const { api, emit, wrapper } = setup({ loadMode: 'infinite' })

		api.handleScroll(scrollEvent({ scrollTop: 0, scrollHeight: 1000, clientHeight: 300 }))
		expect(emit).not.toHaveBeenCalledWith('load-more')

		api.handleScroll({ target: null } as unknown as Event)
		expect(emit).not.toHaveBeenCalledWith('load-more')

		api.handleScroll(scrollEvent({ scrollTop: 680, scrollHeight: 1000, clientHeight: 300 }))
		expect(emit).toHaveBeenCalledWith('load-more')
		expect(api.displayedRows.value).toHaveLength(4)
		wrapper.unmount()
	})

	it('прокрутка не догружает вне бесконечного режима, во время загрузки и когда строк больше нет', () => {
		const nearBottom = scrollEvent({ scrollTop: 700, scrollHeight: 1000, clientHeight: 300 })

		const paged = setup()
		paged.api.handleScroll(nearBottom)
		expect(paged.emit).not.toHaveBeenCalledWith('load-more')
		paged.wrapper.unmount()

		const loading = setup({ loadMode: 'infinite', isLoading: true })
		loading.api.handleScroll(nearBottom)
		expect(loading.emit).not.toHaveBeenCalledWith('load-more')
		loading.wrapper.unmount()

		const all = setup({ loadMode: 'infinite', pageSize: 10 })
		all.api.handleScroll(nearBottom)
		expect(all.emit).not.toHaveBeenCalledWith('load-more')
		all.wrapper.unmount()
	})

	it('ресайз колонки сообщает column-resize и копию колонок в columns-change', () => {
		const { api, emit, wrapper } = setup()
		const tr = document.createElement('tr')
		const ths = [120, 100].map(width => {
			const th = document.createElement('th')
			Object.defineProperty(th, 'offsetWidth', { value: width })
			tr.appendChild(th)
			return th
		})
		document.body.appendChild(tr)

		api.startResize({ target: ths[0], pageX: 0 } as unknown as MouseEvent, COLUMNS[0])
		const move = new MouseEvent('mousemove')
		Object.defineProperty(move, 'pageX', { value: 30 })
		document.dispatchEvent(move)
		document.dispatchEvent(new MouseEvent('mouseup'))

		expect(emit).toHaveBeenCalledWith('column-resize', 'name', 150)
		const changed = emit.mock.calls.find(call => call[0] === 'columns-change')?.[1] as TableColumn[]
		expect(changed.map(column => column.width)).toEqual(['150px', '70px'])
		expect(changed[0]).not.toBe(api.localColumns.value[0])
		tr.remove()
		wrapper.unmount()
	})

	it('resizeColumnBy меняет ширину колонки по ручке и сообщает column-resize', () => {
		const { api, emit, wrapper } = setup()
		const tr = document.createElement('tr')
		const ths = [120, 100].map(width => {
			const th = document.createElement('th')
			Object.defineProperty(th, 'offsetWidth', { value: width })
			th.appendChild(document.createElement('div'))
			tr.appendChild(th)
			return th
		})
		document.body.appendChild(tr)

		api.resizeColumnBy(ths[0].firstElementChild as HTMLElement, COLUMNS[0], 10)

		expect(emit).toHaveBeenCalledWith('column-resize', 'name', 130)
		tr.remove()
		wrapper.unmount()
	})

	it('клик по отключённой строке сообщает row-click, но не раскрывает её', () => {
		const { api, emit, wrapper } = setup()
		const row: TableRow = { id: 'x', data: {}, isExpandable: true, isDisabled: true }

		api.handleRowClick(row)

		expect(emit).toHaveBeenCalledWith('row-click', row)
		expect(emit).not.toHaveBeenCalledWith('expand', expect.anything())
		wrapper.unmount()
	})

	it('раскрытие строки по клику сообщает row-click и expand', () => {
		const { api, emit, wrapper } = setup()
		const row: TableRow = { id: 'x', data: {}, isExpandable: true }

		api.handleRowClick(row)

		expect(emit).toHaveBeenCalledWith('row-click', row)
		expect(emit).toHaveBeenCalledWith('expand', { ...row, isExpanded: true })
		expect(api.isExpanded(row)).toBe(true)
		wrapper.unmount()
	})

	describe('события данных', () => {
		afterEach(() => {
			vi.useRealTimers()
		})

		it('поиск сообщает search после задержки и оставляет совпавшие строки', () => {
			vi.useFakeTimers()
			const { api, emit, wrapper } = setup()

			api.handleSearchInput('Строка 3')
			vi.runAllTimers()

			expect(emit).toHaveBeenCalledWith('search', 'Строка 3')
			expect(api.processedRows.value.map(row => row.id)).toEqual([3])
			wrapper.unmount()
		})

		it('сортировка сообщает sort', () => {
			const { api, emit, wrapper } = setup()

			api.handleSort({ key: 'age', label: 'Возраст', isSortable: true })

			expect(emit).toHaveBeenCalledWith('sort', [{ key: 'age', direction: 'asc' }])
			expect(api.getSortDirection('age')).toBe('asc')
			wrapper.unmount()
		})

		it('фильтр из тулбара сообщает filter, удаление — пустой список', () => {
			const { api, emit, wrapper } = setup({ hasSearch: false })
			expect(api.showToolbar.value).toBe(false)
			expect(api.filterColumnOptions.value.map(option => option.value)).toEqual(['name', 'age'])

			api.setFilterColumn('age')
			api.setFilterOperator('gt')
			api.filterValue.value = '22'
			api.handleAddFilter()
			expect(emit).toHaveBeenLastCalledWith('filter', [{ key: 'age', operator: 'gt', value: '22' }])
			expect(api.processedRows.value.map(row => row.id)).toEqual([4, 5])

			api.handleRemoveFilter(0)
			expect(emit).toHaveBeenLastCalledWith('filter', [])
			wrapper.unmount()
		})

		it('смена размера страницы сообщает page-size-change', () => {
			const { api, emit, wrapper } = setup()

			api.handlePageSizeChange('10')

			expect(emit).toHaveBeenCalledWith('page-size-change', 10)
			expect(api.displayedRows.value).toHaveLength(5)
			wrapper.unmount()
		})
	})
})
