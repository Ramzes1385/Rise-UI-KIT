/** Composable: выбор узлов дерева в режимах single и multiple */
import { toggleTreeSelection } from '@utils/navigation/treeUtils'
import type { TreeStateContext, UseTreeStateOptions } from './types/useTreeState.types'

/** Описание: single — один узел; multiple — каскад по доступным потомкам и пересчёт предков снизу вверх */
function createTreeSelection(context: TreeStateContext, options: UseTreeStateOptions) {
	const { internalSelectedIds, index, selectedIds, selectedSet } = context
	const { selectionMode, emit } = options

	function selectNode(id: string): void {
		const mode = selectionMode.value
		if (mode === 'none' || index.value.nodes.get(id)?.isDisabled) return

		const isSelected = selectedSet.value.has(id)
		let next: string[]
		if (mode === 'single') next = isSelected ? [] : [id]
		else next = toggleTreeSelection(index.value, selectedIds.value, id)

		internalSelectedIds.value = next
		emit('update:selectedIds', next)
		emit('select', id, !isSelected)
	}

	return { selectNode }
}

export { createTreeSelection }
