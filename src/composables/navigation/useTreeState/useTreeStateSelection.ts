/** Composable: выбор узлов дерева в режимах single/multi/checkbox */
import type { TreeStateContext, UseTreeStateOptions } from './types/useTreeState.types'

/** Описание: single — один узел; multi/checkbox — узел вместе с потомками */
function createTreeSelection(context: TreeStateContext, options: UseTreeStateOptions) {
	const { internalSelectedIds, descendantsCache, selectedIds, selectedSet } = context
	const { selectionMode, emit } = options

	function handleSingleSelection(id: string, isSelected: boolean): void {
		const newIds = isSelected ? [] : [id]
		internalSelectedIds.value = newIds
		emit('update:selectedIds', newIds)
		emit('select', id, !isSelected)
	}

	function handleCascadeSelection(id: string, isSelected: boolean): void {
		const current = [...selectedIds.value]
		const descendantIds = descendantsCache.get(id) ?? []
		const affectedIds = [id, ...descendantIds]
		const affectedSet = new Set(affectedIds)

		let newIds: string[]
		if (isSelected) {
			newIds = current.filter(function isNotAffected(i): boolean {
				return !affectedSet.has(i)
			})
		} else {
			newIds = [...new Set([...current, ...affectedIds])]
		}

		internalSelectedIds.value = newIds
		emit('update:selectedIds', newIds)
		emit('select', id, !isSelected)
	}

	function selectNode(id: string): void {
		const mode = selectionMode.value
		if (mode === 'none') {
			return
		}

		const isSelected = selectedSet.value.has(id)
		if (mode === 'single') {
			handleSingleSelection(id, isSelected)
		} else {
			handleCascadeSelection(id, isSelected)
		}
	}

	return { selectNode }
}

export { createTreeSelection }
