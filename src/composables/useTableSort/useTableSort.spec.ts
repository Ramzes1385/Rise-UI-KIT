/**
 * Unit-тесты для useTableSort.
 */

import { createApp, h, ref } from 'vue'
import { useTableSort } from './useTableSort'
import type { TableColumn } from '@components/BaseTable/model/BaseTable.types'

const testColumns = ref<TableColumn[]>([
	{ key: 'name', label: 'Имя', isSortable: true, sortType: 'string' },
	{ key: 'age', label: 'Возраст', isSortable: true, sortType: 'number' },
])

function withSetup<T>(composable: () => T): [T, () => void] {
	let result: T
	const app = createApp({
		setup() {
			result = composable()
			return () => h('div')
		},
	})
	const el = document.createElement('div')
	app.mount(el)
	return [result!, () => app.unmount()]
}

describe('useTableSort', () => {
	it('переключает направление asc → desc → null', () => {
		const { sortStates, handleSort } = useTableSort({ isMultiSort: () => false })
		const nameCol = testColumns.value[0]

		handleSort(nameCol)
		expect(sortStates.value).toHaveLength(1)
		expect(sortStates.value[0].direction).toBe('asc')

		handleSort(nameCol)
		expect(sortStates.value[0].direction).toBe('desc')

		handleSort(nameCol)
		expect(sortStates.value).toHaveLength(0)
	})

	it('не меняет состояние для не-sortable колонки', () => {
		const { sortStates, handleSort } = useTableSort({ isMultiSort: () => false })
		handleSort({ key: 'name', label: 'Имя', isSortable: false })
		expect(sortStates.value).toHaveLength(0)
	})

	it('поддерживает мульти-сортировку', () => {
		const { sortStates, handleSort } = useTableSort({ isMultiSort: () => true })

		handleSort(testColumns.value[0])
		handleSort(testColumns.value[1])

		expect(sortStates.value).toHaveLength(2)
		expect(sortStates.value[0].key).toBe('name')
		expect(sortStates.value[1].key).toBe('age')
	})

	it('getSortDirection возвращает направление или null', () => {
		const { getSortDirection, handleSort } = useTableSort({ isMultiSort: () => false })
		expect(getSortDirection('name')).toBe(null)
		handleSort(testColumns.value[0])
		expect(getSortDirection('name')).toBe('asc')
	})

	it('getSortIndex возвращает порядковый номер в мульти-сортировке', () => {
		const { getSortIndex, handleSort } = useTableSort({ isMultiSort: () => true })
		handleSort(testColumns.value[0])
		handleSort(testColumns.value[1])
		expect(getSortIndex('name')).toBe(1)
		expect(getSortIndex('age')).toBe(2)
	})

	it('вызывает onSort при изменении', () => {
		const onSort = vi.fn()
		const { handleSort } = useTableSort({ isMultiSort: () => false, onSort })
		handleSort(testColumns.value[0])
		expect(onSort).toHaveBeenCalledTimes(1)
		expect(onSort.mock.calls[0][0]).toHaveLength(1)
	})
})
