/** Composable: раскрытие и сворачивание узлов дерева */
import type { TreeStateContext } from './types/useTreeState.types'
import type { BaseTreeEmits } from '@components/BaseTree/types/BaseTree.types'

/** Описание: переключение одного узла и раскрытие нескольких узлов разом */
function createTreeExpansion(context: TreeStateContext, emit: BaseTreeEmits) {
	const { internalExpandedIds, expandedIds, expandedSet } = context

	function toggleNode(id: string): void {
		const current = [...expandedIds.value]
		const pos = current.indexOf(id)
		const isExpanded = pos > -1

		if (isExpanded) {
			current.splice(pos, 1)
		} else {
			current.push(id)
		}

		internalExpandedIds.value = current
		emit('update:expandedIds', current)
		emit('toggle', id, !isExpanded)
	}

	/** Раскрыть несколько узлов разом (клавиша `*` раскрывает соседей) — одно событие update:expandedIds */
	function expandNodes(ids: string[]): void {
		const toExpand = ids.filter(id => !expandedSet.value.has(id))
		if (!toExpand.length) return
		const next = [...expandedIds.value, ...toExpand]
		internalExpandedIds.value = next
		emit('update:expandedIds', next)
		for (const id of toExpand) emit('toggle', id, true)
	}

	return { toggleNode, expandNodes }
}

export { createTreeExpansion }
