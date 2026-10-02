import { computed, nextTick, ref } from 'vue'
import { useTablePagination } from '../useTablePagination'
import type { TableRow } from '@components/BaseTable/types/BaseTable.types'

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

	it('TBL-3: страница сохраняется, пока она есть, и сдвигается на последнюю, когда строк стало меньше', async () => {
		const rows = ref<TableRow[]>(Array.from({ length: 6 }, (_, index) => ({ id: index, data: {} })))
		const { currentPage, displayedRows } = useTablePagination({ processedRows: rows, loadMode: () => 'pagination', pageSize: ref(2) })
		currentPage.value = 3
		rows.value = rows.value.slice()
		await nextTick()
		expect(currentPage.value).toBe(3)
		rows.value = rows.value.slice(0, 3)
		await nextTick()
		expect(currentPage.value).toBe(2)
		expect(displayedRows.value.map(row => row.id)).toEqual([2])
		rows.value = []
		await nextTick()
		expect(currentPage.value).toBe(1)
	})

	it('TBL-8: смена prop pageSize возвращает на первую страницу и сбрасывает догрузку', async () => {
		const pageSize = ref(2)
		const { currentPage, localPageSize } = useTablePagination({ processedRows: testRows, loadMode: () => 'pagination', pageSize })
		currentPage.value = 2
		pageSize.value = 3
		await nextTick()
		expect(localPageSize.value).toBe(3)
		expect(currentPage.value).toBe(1)
	})

	it('TBL-8: в режиме button смена pageSize сбрасывает число показанных строк', async () => {
		const pageSize = ref(1)
		const { displayedRows, loadMore } = useTablePagination({ processedRows: testRows, loadMode: () => 'button', pageSize })
		loadMore()
		loadMore()
		expect(displayedRows.value).toHaveLength(3)
		pageSize.value = 2
		await nextTick()
		expect(displayedRows.value).toHaveLength(2)
	})

	it('TBL-4: hasMore оставляет подгрузку, когда все переданные строки уже показаны', () => {
		const hasMore = ref(true)
		const { hasMoreRows } = useTablePagination({
			processedRows: testRows,
			loadMode: () => 'button',
			pageSize: ref(10),
			hasMore: () => hasMore.value,
		})
		expect(hasMoreRows.value).toBe(true)
		hasMore.value = false
		expect(hasMoreRows.value).toBe(false)
	})
})
