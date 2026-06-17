import type { TreeNode } from './BaseTree.types'
import type { VNode } from 'vue'

export interface BaseTreeChildrenProps {
	children: TreeNode[]
	depth: number
	sizeScale: number
	isExpanded: boolean
	wasExpanded: boolean
}

export interface BaseTreeChildrenSlots {
	icon?: (props: { node: TreeNode }) => VNode[]
	arrow?: (props: { node: TreeNode; isExpanded: boolean }) => VNode[]
	label?: (props: { node: TreeNode; depth: number; isSelected: boolean; isExpanded: boolean }) => VNode[]
	actions?: (props: { node: TreeNode }) => VNode[]
}
