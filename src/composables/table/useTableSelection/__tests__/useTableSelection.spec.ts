import { computed, nextTick, ref } from 'vue'
import { useTableSelection } from '../useTableSelection'
import type { TableRow } from '@components/BaseTable/types/BaseTable.types'

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

		it('с isKeepingOutOfScope выбор вне области (страница 1) сохраняется при выборе и снятии на странице 2', () => {
			const rows = ref<TableRow[]>(allRows())
			const filteredRows = computed(() => rows.value.filter(row => row.id === 'c'))
			const { selectedIds, toggleRow, toggleAll } = useTableSelection({ rows, filteredRows, isKeepingOutOfScope: () => true })

			toggleRow(rows.value[0])
			toggleAll()
			expect([...selectedIds.value].sort()).toEqual(['a', 'c'])
			toggleAll()
			expect([...selectedIds.value]).toEqual(['a'])
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

	describe('TBL-3: смена rows', () => {
		it('выбор пользователя сохраняется, если родитель передал новый массив с теми же строками', async () => {
			const rows = ref<TableRow[]>([
				{ id: '1', data: {} },
				{ id: '2', data: {} },
			])
			const onSelect = vi.fn()
			const { isSelected, toggleRow } = useTableSelection({ rows, onSelect })
			toggleRow(rows.value[0])
			onSelect.mockClear()
			rows.value = rows.value.map(row => ({ ...row }))
			await nextTick()
			expect(isSelected(rows.value[0])).toBe(true)
			expect(onSelect).not.toHaveBeenCalled()
		})

		it('исчезнувшие строки выпадают из выбора, и select сообщает оставшийся выбор', async () => {
			const rows = ref<TableRow[]>([
				{ id: '1', data: {} },
				{ id: '2', data: {} },
			])
			const onSelect = vi.fn()
			const { selectedIds, toggleRow } = useTableSelection({ rows, onSelect })
			toggleRow(rows.value[0])
			toggleRow(rows.value[1])
			onSelect.mockClear()
			rows.value.splice(0, 1)
			await nextTick()
			expect([...selectedIds.value]).toEqual(['2'])
			expect(onSelect).toHaveBeenCalledWith([rows.value[0]])
		})

		it('изменённый родителем isSelected применяется, новые строки берут isSelected', async () => {
			const rows = ref<TableRow[]>([{ id: '1', data: {}, isSelected: true }])
			const { isSelected } = useTableSelection({ rows })
			rows.value = [
				{ id: '1', data: {}, isSelected: false },
				{ id: '2', data: {}, isSelected: true },
				{ id: '3', data: {} },
			]
			await nextTick()
			expect(rows.value.map(row => isSelected(row))).toEqual([false, true, false])
		})
	})

	it('№ 7: isSomeSelected — выбрана часть доступных строк отфильтрованного набора', () => {
		const rows = ref<TableRow[]>([
			{ id: '1', data: {} },
			{ id: '2', data: {} },
			{ id: '3', data: {}, isDisabled: true, isSelected: true },
		])
		const { isSomeSelected, isAllSelected, toggleRow } = useTableSelection({ rows })
		expect(isSomeSelected.value).toBe(false)
		toggleRow(rows.value[0])
		expect(isSomeSelected.value).toBe(true)
		toggleRow(rows.value[1])
		expect(isAllSelected.value).toBe(true)
		expect(isSomeSelected.value).toBe(false)
	})
	it('isSelectAllDisabled — в отфильтрованном наборе нет доступных строк (п. 11 проверки)', () => {
		const rows = ref<TableRow[]>([
			{ id: '1', data: {} },
			{ id: '2', data: {}, isDisabled: true },
		])
		const filteredRows = ref<TableRow[]>(rows.value)
		const { isSelectAllDisabled } = useTableSelection({ rows, filteredRows })
		expect(isSelectAllDisabled.value).toBe(false)
		filteredRows.value = [rows.value[1]]
		expect(isSelectAllDisabled.value).toBe(true)
		filteredRows.value = []
		expect(isSelectAllDisabled.value).toBe(true)
	})
})

describe('useTableSelection: управляемый выбор и clearSelection', () => {
	const makeRows = (): TableRow[] => [
		{ id: '1', data: {} },
		{ id: '2', data: {}, isDisabled: true },
		{ id: '3', data: {} },
	]

	it('selectedIds снаружи: isSelected берёт набор из опции, а не из row.isSelected', () => {
		const rows = ref<TableRow[]>(makeRows().map(row => ({ ...row, isSelected: true })))
		const ids = ref<string[]>(['3'])
		const { isSelected, selectedIds } = useTableSelection({ rows, selectedIds: () => ids.value })
		expect(rows.value.map(row => isSelected(row))).toEqual([false, false, true])
		ids.value = ['1', '99']
		expect([...selectedIds.value]).toEqual(['1', '99'])
	})

	it('toggleRow в управляемом режиме сообщает новый набор и не меняет внутренний', () => {
		const rows = ref<TableRow[]>(makeRows())
		const onSelectedIdsChange = vi.fn()
		const onSelect = vi.fn()
		const { isSelected, toggleRow } = useTableSelection({ rows, onSelect, selectedIds: () => ['99'], onSelectedIdsChange })
		toggleRow(rows.value[0])
		expect(onSelectedIdsChange).toHaveBeenCalledWith(['99', '1'])
		expect(onSelect).toHaveBeenCalledWith([rows.value[0]])
		expect(isSelected(rows.value[0])).toBe(false)
	})

	it('toggleAll сохраняет выбранные id, которых нет в rows (другие страницы)', () => {
		const rows = ref<TableRow[]>(makeRows())
		const onSelectedIdsChange = vi.fn()
		const { toggleAll } = useTableSelection({ rows, selectedIds: () => ['99'], onSelectedIdsChange })
		toggleAll()
		expect(onSelectedIdsChange).toHaveBeenCalledWith(['99', '1', '3'])
	})

	it('смена rows не пересобирает управляемый выбор и не вызывает колбэки', async () => {
		const rows = ref<TableRow[]>(makeRows())
		const onSelectedIdsChange = vi.fn()
		useTableSelection({ rows, selectedIds: () => ['1'], onSelectedIdsChange })
		rows.value = [{ id: '5', data: {}, isSelected: true }]
		await nextTick()
		expect(onSelectedIdsChange).not.toHaveBeenCalled()
	})

	it('исчезнувшая строка внутреннего выбора сообщается и в onSelectedIdsChange', async () => {
		const rows = ref<TableRow[]>(makeRows())
		const onSelectedIdsChange = vi.fn()
		const { toggleRow } = useTableSelection({ rows, onSelectedIdsChange })
		toggleRow(rows.value[0])
		toggleRow(rows.value[2])
		onSelectedIdsChange.mockClear()
		rows.value = rows.value.slice(1)
		await nextTick()
		expect(onSelectedIdsChange).toHaveBeenCalledWith(['3'])
	})

	it('clearSelection снимает выбор, включая disabled, и молчит, если выбора нет', () => {
		const rows = ref<TableRow[]>([
			{ id: '1', data: {}, isSelected: true },
			{ id: '2', data: {}, isDisabled: true, isSelected: true },
		])
		const onSelect = vi.fn()
		const onSelectedIdsChange = vi.fn()
		const { clearSelection, selectedIds } = useTableSelection({ rows, onSelect, onSelectedIdsChange })
		clearSelection()
		expect(selectedIds.value.size).toBe(0)
		expect(onSelect).toHaveBeenCalledWith([])
		expect(onSelectedIdsChange).toHaveBeenCalledWith([])
		clearSelection()
		expect(onSelectedIdsChange).toHaveBeenCalledTimes(1)
	})
})
