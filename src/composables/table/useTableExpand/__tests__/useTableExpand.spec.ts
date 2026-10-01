import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useTableExpand } from '../useTableExpand'
import type { BaseTableEmits, TableRow } from '@components/BaseTable/types/BaseTable.types'

function setup(initial: TableRow[]) {
	const rows = ref<TableRow[]>(initial)
	const emit = vi.fn()
	const api = useTableExpand({ rows: () => rows.value, emit: emit as unknown as BaseTableEmits })
	return { rows, emit, ...api }
}

describe('useTableExpand', () => {
	it('строки с isExpanded раскрыты сразу, остальные — нет', () => {
		const { isExpanded } = setup([
			{ id: 1, data: {}, isExpandable: true, isExpanded: true },
			{ id: 2, data: {}, isExpandable: true },
		])
		expect(isExpanded({ id: 1, data: {} })).toBe(true)
		expect(isExpanded({ id: 2, data: {} })).toBe(false)
	})

	it('toggleExpand раскрывает и сворачивает строку и сообщает новое состояние', () => {
		const row: TableRow = { id: 'a', data: { name: 'A' }, isExpandable: true }
		const { isExpanded, toggleExpand, emit } = setup([row])

		toggleExpand(row)
		expect(isExpanded(row)).toBe(true)
		expect(emit).toHaveBeenLastCalledWith('expand', { ...row, isExpanded: true })

		toggleExpand(row)
		expect(isExpanded(row)).toBe(false)
		expect(emit).toHaveBeenLastCalledWith('expand', { ...row, isExpanded: false })
	})

	it('новые строки с isExpanded добавляются к раскрытым, выбор пользователя сохраняется', async () => {
		const first: TableRow = { id: 1, data: {}, isExpandable: true }
		const ctx = setup([first])
		ctx.toggleExpand(first)

		ctx.rows.value = [first, { id: 2, data: {}, isExpanded: true }]
		await Promise.resolve()

		expect(ctx.isExpanded(first)).toBe(true)
		expect(ctx.isExpanded({ id: 2, data: {} })).toBe(true)
	})

	it('клик по раскрываемой строке сообщает row-click и раскрывает её', () => {
		const row: TableRow = { id: 1, data: {}, isExpandable: true }
		const { handleRowClick, isExpanded, emit } = setup([row])

		handleRowClick(row)

		expect(emit).toHaveBeenCalledWith('row-click', row)
		expect(isExpanded(row)).toBe(true)
	})

	it('клик по строке с дочерними строками раскрывает её', () => {
		const row: TableRow = { id: 1, data: {}, children: [{ id: 2, data: {} }] }
		const { handleRowClick, isExpanded } = setup([row])

		handleRowClick(row)

		expect(isExpanded(row)).toBe(true)
	})

	it('клик по обычной строке только сообщает row-click', () => {
		const row: TableRow = { id: 1, data: {}, children: [] }
		const { handleRowClick, isExpanded, emit } = setup([row])

		handleRowClick(row)

		expect(emit).toHaveBeenCalledTimes(1)
		expect(emit).toHaveBeenCalledWith('row-click', row)
		expect(isExpanded(row)).toBe(false)
	})
})
