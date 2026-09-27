/**
 * Unit-тесты для useTableSelection.
 */

import { computed, nextTick, ref } from 'vue'
import { useTableSelection } from './useTableSelection'
import type { TableRow } from '@components/BaseTable/model/BaseTable.types'

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

	// Регрессия TBL-2: «Выбрать все» действует на строки, прошедшие поиск и фильтры
	describe('toggleAll с filteredRows', () => {
		const allRows = (): TableRow[] => [
			{ id: 'a', data: { name: 'Анна' } },
			{ id: 'b', data: { name: 'Борис' } },
			{ id: 'c', data: { name: 'Алина' } },
		]

		it('выбирает только отфильтрованные строки, скрытые не попадают в payload', () => {
			const onSelect = vi.fn()
			const rows = ref<TableRow[]>(allRows())
			const filteredRows = computed(() => rows.value.filter(row => row.id !== 'b'))
			const { isSelected, toggleAll } = useTableSelection({ rows, filteredRows, onSelect })

			toggleAll()

			expect(isSelected(rows.value[0])).toBe(true)
			expect(isSelected(rows.value[1])).toBe(false)
			expect(isSelected(rows.value[2])).toBe(true)
			expect(onSelect.mock.calls[0][0].map((row: TableRow) => row.id)).toEqual(['a', 'c'])
		})

		it('isAllSelected учитывает только отфильтрованные строки', () => {
			const rows = ref<TableRow[]>(allRows())
			const filteredRows = computed(() => rows.value.filter(row => row.id === 'a'))
			const { isAllSelected, toggleRow } = useTableSelection({ rows, filteredRows })

			toggleRow(rows.value[0])

			expect(isAllSelected.value).toBe(true)
		})

		it('снимает выбор симметрично: ранее выбранная скрытая строка тоже не остаётся в payload', () => {
			const onSelect = vi.fn()
			const rows = ref<TableRow[]>(allRows())
			const query = ref('')
			const filteredRows = computed(() => rows.value.filter(row => String(row.data.name).startsWith(query.value)))
			const { isAllSelected, isSelected, toggleAll, toggleRow } = useTableSelection({ rows, filteredRows, onSelect })

			// Пользователь выбрал «Борис», затем поиском оставил только строки на «А»
			toggleRow(rows.value[1])
			query.value = 'А'
			toggleAll()

			expect(onSelect.mock.lastCall![0].map((row: TableRow) => row.id)).toEqual(['a', 'c'])
			expect(isSelected(rows.value[1])).toBe(false)
			expect(isAllSelected.value).toBe(true)

			toggleAll()

			expect(onSelect.mock.lastCall![0]).toEqual([])
			expect(isAllSelected.value).toBe(false)
		})

		it('не меняет выбор disabled-строк: их нельзя изменить ни чекбоксом строки, ни заголовочным', () => {
			const rows = ref<TableRow[]>([
				{ id: 'locked', data: {}, isDisabled: true, isSelected: true },
				{ id: 'free', data: {} },
			])
			const { isSelected, toggleAll } = useTableSelection({ rows })

			toggleAll()
			expect(isSelected(rows.value[0])).toBe(true)
			expect(isSelected(rows.value[1])).toBe(true)

			toggleAll()
			expect(isSelected(rows.value[0])).toBe(true)
			expect(isSelected(rows.value[1])).toBe(false)
		})

		it('ничего не делает, если в отфильтрованном наборе нет доступных строк', () => {
			const onSelect = vi.fn()
			const rows = ref<TableRow[]>(allRows())
			const filteredRows = computed((): TableRow[] => [])
			const { isSelected, toggleAll, toggleRow } = useTableSelection({ rows, filteredRows, onSelect })

			toggleRow(rows.value[1])
			onSelect.mockClear()
			toggleAll()

			expect(onSelect).not.toHaveBeenCalled()
			expect(isSelected(rows.value[1])).toBe(true)
		})
	})
})
