import type { TreeNode } from './BaseTree.types'

export interface BaseTreeNodeProps {
	node: TreeNode
	depth: number
	sizeScale: number
}

export interface BaseTreeNodeSlots {
	icon?: (props: { node: TreeNode }) => unknown
	arrow?: (props: { node: TreeNode; isExpanded: boolean }) => unknown
	label?: (props: { node: TreeNode; depth: number; isSelected: boolean; isExpanded: boolean }) => unknown
	actions?: (props: { node: TreeNode }) => unknown
}
