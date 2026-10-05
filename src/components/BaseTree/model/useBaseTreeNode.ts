import type { ComputedRef } from 'vue'
import { TREE_CONTEXT_KEY } from '../types/BaseTree.types'
import type { TreeContext } from '../types/BaseTree.types'
import type { BaseTreeNodeProps } from '../types/BaseTreeNode.types'
import { computed, inject, nextTick, onMounted, onUpdated, ref, useId, watch } from 'vue'

const ACTION_FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex], [contenteditable="true"]'
const SAVED_TABINDEX = 'data-rise-tree-tabindex'

function removeFromTabOrder(element: HTMLElement): void {
	if (!element.hasAttribute(SAVED_TABINDEX)) element.setAttribute(SAVED_TABINDEX, element.getAttribute('tabindex') ?? '')
	element.setAttribute('tabindex', '-1')
}

function restoreTabOrder(element: HTMLElement): void {
	const saved = element.getAttribute(SAVED_TABINDEX)
	if (saved === null) return
	element.removeAttribute(SAVED_TABINDEX)
	if (saved) element.setAttribute('tabindex', saved)
	else element.removeAttribute('tabindex')
}

function useActionsTabOrder(tabIndex: ComputedRef<number>) {
	const actionsRef = ref<HTMLElement | null>(null)
	const sync = (): void => {
		const update = tabIndex.value < 0 ? removeFromTabOrder : restoreTabOrder
		actionsRef.value?.querySelectorAll<HTMLElement>(ACTION_FOCUSABLE).forEach(update)
	}
	onMounted(sync)
	onUpdated(sync)
	return { actionsRef }
}

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

function useBranchOpen(isExpanded: ComputedRef<boolean>, getHeader: () => HTMLElement | null) {
	const wasExpanded = ref(isExpanded.value)
	const isOpen = ref(isExpanded.value)
	watch(isExpanded, async expanded => {
		if (expanded && !wasExpanded.value) {
			wasExpanded.value = true
			await nextTick()
			getHeader()?.parentElement?.getBoundingClientRect()
		}
		isOpen.value = isExpanded.value
	})
	return { wasExpanded, isOpen }
}

function useNodeState(props: BaseTreeNodeProps, treeContext: TreeContext, getHeader: () => HTMLElement | null) {
	const childNodes = computed(() => treeContext.childrenOf(props.node))
	const hasChildren = computed(() => childNodes.value.length > 0)
	const isExpanded = computed(() => treeContext.expandedSet.value.has(props.node.id))
	const isSelected = computed(() => treeContext.selectedSet.value.has(props.node.id))
	const isIndeterminate = computed(() => treeContext.indeterminateSet.value.has(props.node.id))

	return {
		hasChildren,
		isExpanded,
		isSelected,
		isIndeterminate,
		...useBranchOpen(isExpanded, getHeader),
		childNodes,
		ariaChecked: computed(() => {
			if (treeContext.selectionMode.value !== 'multiple') return undefined
			return isIndeterminate.value ? 'mixed' : isSelected.value
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
	const state = useNodeState(props, treeContext, header.getHeader)
	const { actionsRef } = useActionsTabOrder(state.tabIndex)

	return {
		treeContext,
		labelId,
		setHeaderElement: header.setHeaderElement,
		actionsRef,
		...state,
		checkboxClasses: computed(() => ({ root: treeContext.classes.value.checkbox, label: 'base-tree__visually-hidden' })),
		...useNodeHandlers(props, treeContext, { ...state, getHeader: header.getHeader }),
	}
}
