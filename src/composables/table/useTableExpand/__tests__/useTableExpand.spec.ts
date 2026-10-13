import { ref } from 'vue'
import type { Ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useTableExpand } from '../useTableExpand'
import type { BaseTableEmits, TableRow } from '@components/BaseTable/types/BaseTable.types'

type Controlled = Ref<Array<string | number> | undefined>

function setup(initial: TableRow[], controlled?: Controlled) {
	const rows = ref<TableRow[]>(initial)
	const emit = vi.fn()
	const api = useTableExpand({
		rows: () => rows.value,
		expandedIds: controlled ? () => controlled.value : undefined,
		emit: emit as unknown as BaseTableEmits,
	})
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

	it('toggleExpand сообщает новый набор id в update:expandedIds', () => {
		const row: TableRow = { id: 'a', data: {}, isExpandable: true }
		const { toggleExpand, emit } = setup([row])
		toggleExpand(row)
		expect(emit).toHaveBeenCalledWith('update:expandedIds', ['a'])
		toggleExpand(row)
		expect(emit).toHaveBeenLastCalledWith('expand', { ...row, isExpanded: false })
		expect(emit).toHaveBeenCalledWith('update:expandedIds', [])
	})

	it('отключённая строка не раскрывается ни кнопкой, ни кликом', () => {
		const row: TableRow = { id: 1, data: {}, isExpandable: true, isDisabled: true }
		const { toggleExpand, handleRowClick, isExpanded, emit } = setup([row])
		toggleExpand(row)
		handleRowClick(row)
		expect(isExpanded(row)).toBe(false)
		expect(emit).toHaveBeenCalledTimes(1)
		expect(emit).toHaveBeenCalledWith('row-click', row)
	})

	it('isExpanded: false сворачивает раскрытую строку, true — раскрывает снова', async () => {
		const ctx = setup([{ id: 1, data: {}, isExpandable: true, isExpanded: true }])
		expect(ctx.isExpanded({ id: 1, data: {} })).toBe(true)
		ctx.rows.value = [{ id: 1, data: {}, isExpandable: true, isExpanded: false }]
		await Promise.resolve()
		expect(ctx.isExpanded({ id: 1, data: {} })).toBe(false)
		ctx.rows.value = [{ id: 1, data: {}, isExpandable: true, isExpanded: true }]
		await Promise.resolve()
		expect(ctx.isExpanded({ id: 1, data: {} })).toBe(true)
	})

	it('повторная передача тех же строк не раскрывает заново то, что пользователь свернул', async () => {
		const row: TableRow = { id: 1, data: {}, isExpandable: true, isExpanded: true }
		const ctx = setup([row])
		ctx.toggleExpand(row)
		expect(ctx.isExpanded(row)).toBe(false)
		ctx.rows.value = [{ ...row }]
		await Promise.resolve()
		expect(ctx.isExpanded(row)).toBe(false)
	})

	it('id строк, которых больше нет, убираются из раскрытых', async () => {
		const first: TableRow = { id: 1, data: {}, isExpandable: true }
		const ctx = setup([first, { id: 2, data: {}, isExpandable: true, isExpanded: true }])
		ctx.toggleExpand(first)
		expect([...ctx.expandedIds.value]).toEqual([2, 1])
		ctx.rows.value = [first]
		await Promise.resolve()
		expect([...ctx.expandedIds.value]).toEqual([1])
		ctx.rows.value = [{ id: 2, data: {}, isExpandable: true }]
		await Promise.resolve()
		expect(ctx.isExpanded({ id: 2, data: {} })).toBe(false)
	})

	describe('expandedIds снаружи (v-model:expandedIds)', () => {
		it('раскрыты строки из пропа, row.isExpanded не учитывается', () => {
			const controlled: Controlled = ref([2])
			const { isExpanded } = setup(
				[
					{ id: 1, data: {}, isExpandable: true, isExpanded: true },
					{ id: 2, data: {}, isExpandable: true },
				],
				controlled,
			)
			expect(isExpanded({ id: 1, data: {} })).toBe(false)
			expect(isExpanded({ id: 2, data: {} })).toBe(true)
		})

		it('переключение только сообщает набор: строка меняется, когда родитель вернёт проп', () => {
			const controlled: Controlled = ref([2])
			const row: TableRow = { id: 1, data: {}, isExpandable: true }
			const { toggleExpand, isExpanded, emit } = setup([row], controlled)
			toggleExpand(row)
			expect(emit).toHaveBeenCalledWith('update:expandedIds', [2, 1])
			expect(isExpanded(row)).toBe(false)
			controlled.value = [2, 1]
			expect(isExpanded(row)).toBe(true)
			toggleExpand(row)
			expect(emit).toHaveBeenLastCalledWith('expand', { ...row, isExpanded: false })
			expect(emit).toHaveBeenCalledWith('update:expandedIds', [2])
		})

		it('пустой массив — управление снаружи, ничего не раскрыто', () => {
			const controlled: Controlled = ref([])
			const row: TableRow = { id: 1, data: {}, isExpandable: true, isExpanded: true }
			expect(setup([row], controlled).isExpanded(row)).toBe(false)
		})
	})
})
