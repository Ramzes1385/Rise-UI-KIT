import type { TableRow } from '@components/BaseTable/types/BaseTable.types'
import { collectDisabledSelectedIds, collectSelectedIds, toggleSelectedId } from '../useTableSelectionUtils'

const rows: TableRow[] = [
	{ id: 1, data: {}, isSelected: true },
	{ id: 2, data: {}, isDisabled: true, isSelected: true },
	{ id: 3, data: {}, isDisabled: true },
	{ id: 4, data: {} },
]

describe('useTableSelectionUtils', () => {
	it('collectSelectedIds собирает ID строк с isSelected', () => {
		expect([...collectSelectedIds(rows)]).toEqual([1, 2])
	})

	it('toggleSelectedId добавляет отсутствующий ID и не мутирует исходный набор', () => {
		const source = new Set<string | number>([1])
		const next = toggleSelectedId(source, 2)
		expect([...next]).toEqual([1, 2])
		expect([...source]).toEqual([1])
	})

	it('toggleSelectedId удаляет присутствующий ID', () => {
		expect([...toggleSelectedId(new Set<string | number>([1, 2]), 1)]).toEqual([2])
	})

	it('collectDisabledSelectedIds оставляет только выбранные disabled-строки', () => {
		const selected = new Set<string | number>([1, 2, 4])
		expect([...collectDisabledSelectedIds(rows, selected)]).toEqual([2])
	})
})
