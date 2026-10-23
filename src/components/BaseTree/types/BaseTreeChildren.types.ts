import type { TreeNode } from './BaseTree.types'

export interface BaseTreeChildrenProps {
	children: TreeNode[]
	depth: number
	sizeScale: number
	/** Ветка раскрыта (состояние дерева): от него — `inert` и `aria-hidden` свёрнутой ветки */
	isExpanded: boolean
	/** Ветка уже раскрывалась: дети монтируются при первом раскрытии */
	wasExpanded: boolean
	/** Ветка раскрыта на экране: класс `--open`. При первом раскрытии ставится после монтирования свёрнутой ветки — без рывка */
	isOpen: boolean
}

export interface BaseTreeChildrenSlots {
	icon?: (props: { node: TreeNode }) => unknown
	arrow?: (props: { node: TreeNode; isExpanded: boolean }) => unknown
	label?: (props: { node: TreeNode; depth: number; isSelected: boolean; isExpanded: boolean }) => unknown
	actions?: (props: { node: TreeNode }) => unknown
}
