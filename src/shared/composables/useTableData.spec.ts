import { describe, expect, it } from 'vitest'
import { computed, ref } from 'vue'
import { useTableData } from './useTableData'

describe('useTableData', () => {
	const rows = computed(() => [
		{ id: 1, data: { name: 'B' } },
		{ id: 2, data: { name: 'A' } },
	])
	const columns = ref([{ key: 'name', label: 'Name', isSortable: true }])

	it('должен сортировать данные', () => {
		const { processedRows, handleSort } = useTableData({
			rows,
			columns,
			loadMode: () => 'pagination',
			pageSize: computed(() => 10),
			isMultiSort: () => false,
			searchDebounce: () => 300,
		})

		// Сначала без сортировки (порядок как в rows)
		expect(processedRows.value[0].data.name).toBe('B')

		// Сортируем по имени (asc)
		handleSort(columns.value[0])
		expect(processedRows.value[0].data.name).toBe('A')
	})
})
