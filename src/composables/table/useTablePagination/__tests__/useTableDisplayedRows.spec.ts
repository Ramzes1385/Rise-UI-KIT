import { ref } from 'vue'
import { useTableDisplayedRows } from '../useTableDisplayedRows'
import type { TableRow } from '@components/BaseTable/types/BaseTable.types'

const processedRows = ref<TableRow[]>([1, 2, 3, 4, 5].map(id => ({ id, data: {} })))

function setup(mode: string, pageSize: number) {
	return useTableDisplayedRows({
		processedRows,
		loadMode: () => mode,
		currentPage: ref(2),
		localPageSize: ref(pageSize),
		loadedCount: ref(3),
	})
}

function ids(rows: TableRow[]) {
	return rows.map(row => row.id)
}

describe('useTableDisplayedRows', () => {
	it('pagination: срез текущей страницы', () => {
		const { displayedRows, hasMoreRows } = setup('pagination', 2)
		expect(ids(displayedRows.value)).toEqual([3, 4])
		expect(hasMoreRows.value).toBe(false)
	})

	it('pagination без размера страницы: все строки', () => {
		expect(ids(setup('pagination', 0).displayedRows.value)).toEqual([1, 2, 3, 4, 5])
	})

	it.each(['button', 'infinite'])('%s: загруженные строки и признак подгрузки', mode => {
		const { displayedRows, hasMoreRows } = setup(mode, 2)
		expect(ids(displayedRows.value)).toEqual([1, 2, 3])
		expect(hasMoreRows.value).toBe(true)
	})

	it('неизвестный режим: все строки без подгрузки', () => {
		const { displayedRows, hasMoreRows } = setup('none', 2)
		expect(ids(displayedRows.value)).toHaveLength(5)
		expect(hasMoreRows.value).toBe(false)
	})

	it('totalRows в режиме pagination: строки уже страница, не нарезаются', () => {
		const { displayedRows } = useTableDisplayedRows({
			processedRows,
			loadMode: () => 'pagination',
			currentPage: ref(2),
			localPageSize: ref(2),
			loadedCount: ref(3),
			totalRows: () => 50,
		})
		expect(ids(displayedRows.value)).toEqual([1, 2, 3, 4, 5])
	})

	it('totalRows в button и infinite: подгрузка идёт, пока строк меньше totalRows', () => {
		const make = (total: number | undefined) =>
			useTableDisplayedRows({
				processedRows,
				loadMode: () => 'button',
				currentPage: ref(1),
				localPageSize: ref(5),
				loadedCount: ref(5),
				totalRows: () => total,
			}).hasMoreRows.value
		expect(make(8)).toBe(true)
		expect(make(5)).toBe(false)
		expect(make(undefined)).toBe(false)
	})
})
