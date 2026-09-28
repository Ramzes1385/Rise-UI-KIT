import type { ComputedRef } from 'vue'
import { computed, inject, ref, useId, watch } from 'vue'
import { TREE_CONTEXT_KEY } from '../types/BaseTree.types'
import type { TreeContext } from '../types/BaseTree.types'
import type { BaseTreeNodeProps } from '../types/BaseTreeNode.types'

function getTreeContext(): TreeContext {
	const context = inject(TREE_CONTEXT_KEY, undefined)
	if (!context) {
		throw new Error('BaseTreeNode: TreeContext not found. Ensure BaseTreeNode is rendered inside BaseTree.')
	}
	return context
}

function useHeaderRegistration(props: BaseTreeNodeProps, treeContext: TreeContext) {
	let headerElement: HTMLElement | null = null
	return {
		getHeader: (): HTMLElement | null => headerElement,
		setHeaderElement(element: unknown): void {
			if (element instanceof HTMLElement) {
				headerElement = element
				treeContext.registerHeader(props.node.id, element)
			} else if (headerElement) {
				treeContext.unregisterHeader(props.node.id, headerElement)
				headerElement = null
			}
		},
	}
}

function useNodeState(props: BaseTreeNodeProps, treeContext: TreeContext) {
	const hasChildren = computed(() => Boolean(props.node.children?.length))
	const isExpanded = computed(() => treeContext.expandedSet.value.has(props.node.id))
	const isSelected = computed(() => treeContext.selectedSet.value.has(props.node.id))
	const wasExpanded = ref(isExpanded.value)
	watch(isExpanded, expanded => {
		if (expanded && !wasExpanded.value) wasExpanded.value = true
	})

	return {
		hasChildren,
		isExpanded,
		isSelected,
		wasExpanded,
		childNodes: computed(() => {
			return props.node.children ?? []
		}),
		tabIndex: computed(() => treeContext.tabIndexOf(props.node.id)),
		nodeClasses: computed(() => ({
			'base-tree__node--expanded': isExpanded.value,
			'base-tree__node--selected': isSelected.value,
			'base-tree__node--disabled': props.node.isDisabled,
			'base-tree__node--leaf': !hasChildren.value,
			'base-tree__node--flat': props.isFlat,
		})),
	}
}

function useNodeHandlers(
	props: BaseTreeNodeProps,
	treeContext: TreeContext,
	state: { hasChildren: ComputedRef<boolean>; isSelected: ComputedRef<boolean>; getHeader: () => HTMLElement | null },
) {
	return {
		handleArrowClick(): void {
			if (props.node.isDisabled) return
			treeContext.toggleNode(props.node.id)
		},
		handleLinkMousedown(event: MouseEvent): void {
			if (event.button !== 0) return
			event.preventDefault()
			state.getHeader()?.focus()
		},
		handleLinkClick(event: MouseEvent): void {
			event.stopPropagation()
			if (treeContext.selectionMode.value === 'single' && !state.isSelected.value) treeContext.selectNode(props.node.id)
		},
		handleHeaderClick(): void {
			if (props.node.isDisabled) return
			if (treeContext.selectionMode.value !== 'none') {
				treeContext.selectNode(props.node.id)
				return
			}
			if (state.hasChildren.value) treeContext.toggleNode(props.node.id)
		},
	}
}

export function useBaseTreeNode(props: BaseTreeNodeProps) {
	const treeContext = getTreeContext()
	const labelId = `rise-tree-${useId()}-label`
	const header = useHeaderRegistration(props, treeContext)
	const state = useNodeState(props, treeContext)

	return {
		treeContext,
		labelId,
		setHeaderElement: header.setHeaderElement,
		...state,
		checkboxClasses: computed(() => ({ root: treeContext.classes.value.checkbox, label: 'base-tree__visually-hidden' })),
		...useNodeHandlers(props, treeContext, { ...state, getHeader: header.getHeader }),
	}
}
