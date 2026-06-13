/**
 * Unit-тесты для useTableSelection.
 */

import { computed, nextTick, ref } from 'vue'

import type { TableRow } from '@components/BaseTable/model/BaseTable.types'

import { useTableSelection } from './useTableSelection'

describe('useTableSelection', () => {
	it('синхронизирует selectedIds из row.isSelected', async () => {
		const rows = ref<TableRow[]>([{ id: '1', data: {}, isSelected: true }])
		const { isSelected } = useTableSelection({ rows })
		await nextTick()
		expect(isSelected(rows.value[0])).toBe(true)
	})

	it('переключает выбор строки', () => {
		const rows = ref<TableRow[]>([{ id: '1', data: {} }])
		const { isSelected, toggleRow } = useTableSelection({ rows })
		toggleRow(rows.value[0])
		expect(isSelected(rows.value[0])).toBe(true)
		toggleRow(rows.value[0])
		expect(isSelected(rows.value[0])).toBe(false)
	})

	it('вызывает onSelect с выбранными строками', () => {
		const onSelect = vi.fn()
		const rows = ref<TableRow[]>([
			{ id: '1', data: { name: 'Анна' } },
			{ id: '2', data: { name: 'Борис' } },
		])
		const { toggleRow } = useTableSelection({ rows, onSelect })
		toggleRow(rows.value[0])
		expect(onSelect).toHaveBeenCalledWith([rows.value[0]])
	})

	it('toggleAll выбирает все доступные строки', () => {
		const rows = ref<TableRow[]>([
			{ id: '1', data: {} },
			{ id: '2', data: {}, isDisabled: true },
		])
		const { isAllSelected, toggleAll, isSelected } = useTableSelection({ rows })
		toggleAll()
		expect(isSelected(rows.value[0])).toBe(true)
		expect(isSelected(rows.value[1])).toBe(false)
		expect(isAllSelected.value).toBe(true)
	})

	it('toggleAll снимает выбор, если все выбраны', () => {
		const rows = ref<TableRow[]>([
			{ id: '1', data: {}, isSelected: true },
			{ id: '2', data: {}, isSelected: true },
		])
		const { isAllSelected, toggleAll, isSelected } = useTableSelection({ rows })
		toggleAll()
		expect(isSelected(rows.value[0])).toBe(false)
		expect(isSelected(rows.value[1])).toBe(false)
		expect(isAllSelected.value).toBe(false)
	})

	it('selectedRows возвращает только выбранные строки', () => {
		const rows = computed((): TableRow[] => [
			{ id: '1', data: {}, isSelected: true },
			{ id: '2', data: {} },
		])
		const { selectedRows } = useTableSelection({ rows })
		expect(selectedRows.value).toHaveLength(1)
		expect(selectedRows.value[0].id).toBe('1')
	})
})
