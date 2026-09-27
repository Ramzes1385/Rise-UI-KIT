import type { TreeNode } from './BaseTree.types'

export interface BaseTreeNodeProps {
	node: TreeNode
	depth: number
	sizeScale: number
	/** Число узлов на этом уровне у того же родителя (aria-setsize) */
	setSize: number
	/** Позиция узла среди них, с 1 (aria-posinset) */
	posInSet: number
}

export interface BaseTreeNodeSlots {
	icon?: (props: { node: TreeNode }) => unknown
	arrow?: (props: { node: TreeNode; isExpanded: boolean }) => unknown
	label?: (props: { node: TreeNode; depth: number; isSelected: boolean; isExpanded: boolean }) => unknown
	actions?: (props: { node: TreeNode }) => unknown
}
