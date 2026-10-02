import type { TreeIndex } from '@utils/navigation/treeUtils'
import { getTreeChildren } from '@utils/navigation/treeUtils'
import type { TreeNode } from '@components/BaseTree/types/BaseTree.types'
import type { TreeSelectCheckedStrategy, TreeSelectValue } from '../types/BaseTreeSelect.types'

export function toSelectedIds(value: TreeSelectValue, isMultiple: boolean): string[] {
	if (Array.isArray(value)) return isMultiple ? value : value.slice(0, 1)
	if (isMultiple) return []
	return value ? [value] : []
}

function isImpliedByChildren(index: TreeIndex, node: TreeNode, selected: Set<string>): boolean {
	return !node.isDisabled && getTreeChildren(index, node).some(child => !child.isDisabled && selected.has(child.id))
}

function isImpliedByParent(index: TreeIndex, id: string, selected: Set<string>): boolean {
	const parentId = index.parents.get(id)
	if (parentId === undefined || !selected.has(parentId)) return false
	return !index.nodes.get(id)?.isDisabled && !index.nodes.get(parentId)?.isDisabled
}

export function applyCheckedStrategy(index: TreeIndex, ids: string[], strategy: TreeSelectCheckedStrategy): string[] {
	if (strategy === 'all') return ids
	const selected = new Set(ids)
	if (strategy === 'parent') {
		return ids.filter(id => !isImpliedByParent(index, id, selected))
	}
	return ids.filter(id => {
		const node = index.nodes.get(id)
		return !node || !isImpliedByChildren(index, node, selected)
	})
}

export function sortByTreeOrder(index: TreeIndex, ids: string[]): string[] {
	const position = new Map(index.order.map((id, order) => [id, order]))
	return [...ids].sort((left, right) => (position.get(left) ?? position.size) - (position.get(right) ?? position.size))
}
