/** Composable: раскрытие и сворачивание строк таблицы */
import { computed, ref, watch } from 'vue'
import type { TableRow } from '@components/BaseTable/types/BaseTable.types'
import type { UseTableExpandOptions, UseTableExpandReturn } from './types/useTableExpand.types'

/**
 * Переносит `isExpanded` строк во внутренний набор раскрытых id: учитывается только изменение флага (раскрыть при `true`,
 * свернуть при `false`), поэтому повторная передача тех же строк не раскрывает заново то, что пользователь свернул;
 * id строк, которых больше нет, из набора убираются.
 */
function syncDeclaredState(
	rows: TableRow[],
	expanded: { value: Set<TableRow['id']> },
	declared: Map<TableRow['id'], boolean | undefined>,
): void {
	const next = new Set(expanded.value)
	const present = new Set<TableRow['id']>()
	for (const row of rows) {
		present.add(row.id)
		if (row.isExpanded === declared.get(row.id)) continue
		if (row.isExpanded === true) next.add(row.id)
		if (row.isExpanded === false) next.delete(row.id)
		declared.set(row.id, row.isExpanded)
	}
	for (const id of [...next, ...declared.keys()]) {
		if (present.has(id)) continue
		next.delete(id)
		declared.delete(id)
	}
	expanded.value = next
}

/**
 * Composable для раскрытия/сворачивания строк таблицы: набор раскрытых id, переключение, клик по строке.
 * Набор либо внутренний (стартует с `row.isExpanded`), либо управляется снаружи через `expandedIds` (`v-model:expandedIds`):
 * тогда `row.isExpanded` не учитывается, а переключение только сообщает новый набор в `update:expandedIds`.
 */
function useTableExpand(options: UseTableExpandOptions): UseTableExpandReturn {
	const { rows, emit } = options

	const internalIds = ref<Set<TableRow['id']>>(new Set())
	const declared = new Map<TableRow['id'], boolean | undefined>()
	const expandedIds = computed<Set<TableRow['id']>>(() => {
		const controlled = options.expandedIds?.()
		return controlled ? new Set(controlled) : internalIds.value
	})

	function isExpanded(row: TableRow): boolean {
		return expandedIds.value.has(row.id)
	}

	watch(rows, current => syncDeclaredState(current, internalIds, declared), { immediate: true })

	function toggleExpand(row: TableRow): void {
		if (row.isDisabled) return
		const wasExpanded = isExpanded(row)
		const next = new Set(expandedIds.value)
		if (wasExpanded) next.delete(row.id)
		else next.add(row.id)
		if (!options.expandedIds?.()) internalIds.value = next
		emit('update:expandedIds', [...next])
		emit('expand', { ...row, isExpanded: !wasExpanded })
	}

	function handleRowClick(row: TableRow): void {
		emit('row-click', row)
		if (!row.isDisabled && (row.isExpandable || row.children?.length)) {
			toggleExpand(row)
		}
	}

	return {
		expandedIds,
		isExpanded,
		toggleExpand,
		handleRowClick,
	}
}

export { useTableExpand }
