/** Утилиты: расчёт наборов ID выбранных строк таблицы */
import type { TableRow } from '@components/BaseTable/types/BaseTable.types'

/** ID строк, отмеченных isSelected */
function collectSelectedIds(rows: TableRow[]): Set<string | number> {
	const next = new Set<string | number>()
	for (const row of rows) {
		if (row.isSelected) next.add(row.id)
	}
	return next
}

/** Копия набора с переключённым ID строки */
function toggleSelectedId(selectedIds: Set<string | number>, id: string | number): Set<string | number> {
	const next = new Set(selectedIds)
	if (next.has(id)) {
		next.delete(id)
	} else {
		next.add(id)
	}
	return next
}

/** ID выбранных disabled-строк: их выбор не меняется массовым переключением */
function collectDisabledSelectedIds(rows: TableRow[], selectedIds: Set<string | number>): Set<string | number> {
	const next = new Set<string | number>()
	for (const row of rows) {
		if (row.isDisabled && selectedIds.has(row.id)) next.add(row.id)
	}
	return next
}

export { collectDisabledSelectedIds, collectSelectedIds, toggleSelectedId }
