/** Утилиты: расчёт наборов ID выбранных строк таблицы */
import type { TableRow } from '@components/BaseTable/types/BaseTable.types'
import type { MergeSelectedIdsOptions } from './types/useTableSelectionUtils.types'

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

/** Флаги isSelected строк по ID: какие строки есть и что о выборе сказал родитель */
function collectRowFlags(rows: TableRow[]): Map<string | number, boolean | undefined> {
	return new Map(rows.map(row => [row.id, row.isSelected]))
}

/**
 * Выбор после смены rows: строки, которых больше нет, выпадают; у оставшихся выбор пользователя сохраняется,
 * пока родитель не изменил их `isSelected`; новые строки берут `isSelected`
 */
function mergeSelectedIds(options: MergeSelectedIdsOptions): Set<string | number> {
	const { selectedIds, previousFlags, nextFlags } = options
	const next = new Set<string | number>()
	for (const [id, flag] of nextFlags) {
		const isKnown = previousFlags.has(id)
		const isChangedByParent = !isKnown || previousFlags.get(id) !== flag
		const isSelected = isChangedByParent ? Boolean(flag) : selectedIds.has(id)
		if (isSelected) next.add(id)
	}
	return next
}

export { collectDisabledSelectedIds, collectRowFlags, collectSelectedIds, mergeSelectedIds, toggleSelectedId }
