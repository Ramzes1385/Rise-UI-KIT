import type { TreeNode } from './BaseTree.types'

export interface BaseTreeChildrenProps {
	children: TreeNode[]
	depth: number
	sizeScale: number
	isExpanded: boolean
	wasExpanded: boolean
}

export interface BaseTreeChildrenSlots {
	icon?: (props: { node: TreeNode }) => unknown
	arrow?: (props: { node: TreeNode; isExpanded: boolean }) => unknown
	label?: (props: { node: TreeNode; depth: number; isSelected: boolean; isExpanded: boolean }) => unknown
	actions?: (props: { node: TreeNode }) => unknown
}
