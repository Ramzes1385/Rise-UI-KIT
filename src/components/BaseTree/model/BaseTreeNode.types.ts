import type { TreeNode } from './BaseTree.types'
import type { VNode } from 'vue'

export interface BaseTreeNodeProps {
	node: TreeNode
	depth: number
	sizeScale: number
}

export interface BaseTreeNodeSlots {
	icon?: (props: { node: TreeNode }) => VNode[]
	arrow?: (props: { node: TreeNode; isExpanded: boolean }) => VNode[]
	label?: (props: { node: TreeNode; depth: number; isSelected: boolean; isExpanded: boolean }) => VNode[]
	actions?: (props: { node: TreeNode }) => VNode[]
}
