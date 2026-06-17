/**
 * Unit-тесты для useTablePagination.
 */

import { computed, nextTick, ref } from 'vue'
import { useTablePagination } from './useTablePagination'
import type { TableRow } from '@components/BaseTable/model/BaseTable.types'

const testRows = computed((): TableRow[] => [
	{ id: '1', data: { name: 'Анна' } },
	{ id: '2', data: { name: 'Борис' } },
	{ id: '3', data: { name: 'Вика' } },
	{ id: '4', data: { name: 'Глеб' } },
])

describe('useTablePagination', () => {
	it('при loadMode=pagination отображает pageSize строк', () => {
		const { displayedRows } = useTablePagination({
			processedRows: testRows,
			loadMode: () => 'pagination',
			pageSize: ref(2),
		})
		expect(displayedRows.value).toHaveLength(2)
	})

	it('переключение currentPage меняет отображаемые строки', () => {
		const { displayedRows, currentPage } = useTablePagination({
			processedRows: testRows,
			loadMode: () => 'pagination',
			pageSize: ref(2),
		})
		currentPage.value = 2
		expect(displayedRows.value[0].data.name).toBe('Вика')
	})

	it('loadMode=button показывает первые effectivePageSize строк', () => {
		const { displayedRows, hasMoreRows } = useTablePagination({
			processedRows: testRows,
			loadMode: () => 'button',
			pageSize: ref(2),
		})
		expect(displayedRows.value).toHaveLength(2)
		expect(hasMoreRows.value).toBe(true)
	})

	it('loadMore подгружает следующую порцию', () => {
		const { displayedRows, loadMore } = useTablePagination({
			processedRows: testRows,
			loadMode: () => 'button',
			pageSize: ref(2),
		})
		loadMore()
		expect(displayedRows.value).toHaveLength(4)
	})

	it('handlePageSizeChange изменяет pageSize и сбрасывает страницу', () => {
		const { localPageSize, currentPage, handlePageSizeChange } = useTablePagination({
			processedRows: testRows,
			loadMode: () => 'pagination',
			pageSize: ref(2),
		})
		currentPage.value = 2
		handlePageSizeChange(3)
		expect(localPageSize.value).toBe(3)
		expect(currentPage.value).toBe(1)
	})

	it('resetPage сбрасывает currentPage в режиме pagination', () => {
		const { currentPage, resetPage } = useTablePagination({
			processedRows: testRows,
			loadMode: () => 'pagination',
			pageSize: ref(2),
		})
		currentPage.value = 3
		resetPage()
		expect(currentPage.value).toBe(1)
	})

	it('синхронизирует localPageSize с пропсом pageSize', async () => {
		const pageSize = ref(2)
		const { localPageSize } = useTablePagination({
			processedRows: testRows,
			loadMode: () => 'pagination',
			pageSize,
		})
		pageSize.value = 5
		await nextTick()
		expect(localPageSize.value).toBe(5)
	})
})
