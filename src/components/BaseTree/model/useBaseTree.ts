import type { ComputedRef } from 'vue'
import { TREE_CONTEXT_KEY } from '../types/BaseTree.types'
import { findTypeaheadIndex } from '@utils/navigation/menuUtils'
import { useTreeState } from '@composables/navigation/useTreeState'
import { useVirtualList } from '@composables/interaction/useVirtualList'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { computed, nextTick, onBeforeUnmount, provide, ref, toRef } from 'vue'
import type { BaseTreeEmits, TreeNode, TreeProps, VisibleNode } from '../types/BaseTree.types'

const TREE_ELEMENTS = ['root', 'node', 'header', 'arrow', 'checkbox', 'icon', 'label', 'actions', 'children']
const TYPEAHEAD_RESET = 500

function collectVisible(items: TreeNode[], expanded: Set<string>): VisibleNode[] {
	const result: VisibleNode[] = []
	const walk = (nodes: TreeNode[], parentId: string | null, depth: number): void => {
		nodes.forEach((node, index) => {
			result.push({ node, parentId, depth, setSize: nodes.length, posInSet: index + 1 })
			if (node.children?.length && expanded.has(node.id)) walk(node.children, node.id, depth + 1)
		})
	}
	walk(items, null, 0)
	return result
}

function useTreeModel(props: TreeProps, emit: BaseTreeEmits) {
	return useTreeState({
		items: toRef(props, 'items'),
		selectionMode: toRef(props, 'selectionMode'),
		expandedIds: toRef(props, 'expandedIds'),
		selectedIds: toRef(props, 'selectedIds'),
		isDefaultExpandAll: toRef(props, 'isDefaultExpandAll'),
		emit,
	})
}

function useTabbable(visibleNodes: ComputedRef<VisibleNode[]>, tree: ReturnType<typeof useTreeModel>) {
	const activeId = ref<string | null>(null)
	const tabbableId = computed((): string | undefined => {
		const visible = visibleNodes.value
		if (activeId.value && visible.some(({ node }) => node.id === activeId.value)) return activeId.value
		return (visible.find(({ node }) => tree.selectedSet.value.has(node.id)) ?? visible[0])?.node.id
	})
	return {
		activeId,
		tabbableId,
		tabbableIndex: computed(() => visibleNodes.value.findIndex(({ node }) => node.id === tabbableId.value)),
		currentIndex: (): number => visibleNodes.value.findIndex(({ node }) => node.id === activeId.value),
	}
}

function useTreeVirtual(props: TreeProps, visibleNodes: ComputedRef<VisibleNode[]>, tabbableIndex: ComputedRef<number>) {
	const rootRef = ref<HTMLElement | null>(null)
	const virtualStyle = computed(() => {
		if (!props.isVirtual) return undefined
		return { height: typeof props.height === 'number' ? `${props.height}px` : props.height }
	})
	const virtual = useVirtualList({
		count: () => (props.isVirtual ? visibleNodes.value.length : 0),
		estimateSize: () => props.itemSize,
		scrollElement: computed(() => (props.isVirtual ? rootRef.value : null)),
		getKey: index => visibleNodes.value[index].node.id,
		pinnedIndex: () => (tabbableIndex.value === -1 ? undefined : tabbableIndex.value),
	})
	return { rootRef, virtualStyle, ...virtual }
}

function useHeaders(props: TreeProps, visibleNodes: ComputedRef<VisibleNode[]>, scrollToIndex: (index: number) => void) {
	const headers = new Map<string, HTMLElement>()
	let pendingFocusId: string | null = null
	return {
		headers,
		focusNode(id: string | undefined): void {
			if (!id) return
			const header = headers.get(id)
			if (header) header.focus()
			else if (props.isVirtual) {
				pendingFocusId = id
				scrollToIndex(visibleNodes.value.findIndex(({ node }) => node.id === id))
			}
		},
		registerHeader(id: string, element: HTMLElement): void {
			headers.set(id, element)
			if (id !== pendingFocusId) return
			pendingFocusId = null
			void nextTick(() => element.focus())
		},
		unregisterHeader(id: string, element: HTMLElement): void {
			if (headers.get(id) === element) headers.delete(id)
		},
		activate(entry: VisibleNode): void {
			const header = headers.get(entry.node.id)
			const link = header?.querySelector<HTMLElement>('.base-tree__link')
			if (link && !entry.node.isDisabled) link.click()
			else header?.click()
		},
	}
}

function useTreeTypeahead(
	visibleNodes: ComputedRef<VisibleNode[]>,
	currentIndex: () => number,
	focusNode: (id: string | undefined) => void,
) {
	let typeahead = ''
	let typeaheadTimer: ReturnType<typeof setTimeout> | null = null
	onBeforeUnmount(() => {
		if (typeaheadTimer) clearTimeout(typeaheadTimer)
	})
	return {
		isTyping: (): boolean => typeahead !== '',
		handleTypeahead(char: string): void {
			typeahead += char
			if (typeaheadTimer) clearTimeout(typeaheadTimer)
			typeaheadTimer = setTimeout(() => {
				typeahead = ''
				typeaheadTimer = null
			}, TYPEAHEAD_RESET)
			const index = findTypeaheadIndex(
				visibleNodes.value.map(({ node }) => node.label),
				typeahead,
				currentIndex(),
			)
			if (index !== -1) focusNode(visibleNodes.value[index].node.id)
		},
	}
}

function provideTreeContext(
	props: TreeProps,
	tree: ReturnType<typeof useTreeModel>,
	parts: {
		classes: ComputedRef<Record<string, string | undefined>>
		tab: ReturnType<typeof useTabbable>
		headers: ReturnType<typeof useHeaders>
	},
): void {
	provide(TREE_CONTEXT_KEY, {
		selectionMode: toRef(props, 'selectionMode'),
		arrowPosition: toRef(props, 'arrowPosition'),
		expandedIds: tree.expandedIds,
		selectedIds: tree.selectedIds,
		expandedSet: tree.expandedSet,
		selectedSet: tree.selectedSet,
		toggleNode: tree.toggleNode,
		selectNode: tree.selectNode,
		classes: computed(() => parts.classes.value),
		tabIndexOf: (id: string) => (id === parts.tab.tabbableId.value ? 0 : -1),
		setActive: (id: string) => {
			parts.tab.activeId.value = id
		},
		registerHeader: parts.headers.registerHeader,
		unregisterHeader: parts.headers.unregisterHeader,
	})
}

function arrowRight(entry: VisibleNode, tree: ReturnType<typeof useTreeModel>, focusNode: (id: string | undefined) => void): void {
	const { node } = entry
	if (!node.children?.length) return
	if (tree.expandedSet.value.has(node.id)) focusNode(node.children[0]?.id)
	else if (!node.isDisabled) tree.toggleNode(node.id)
}

function arrowLeft(entry: VisibleNode, tree: ReturnType<typeof useTreeModel>, focusNode: (id: string | undefined) => void): void {
	const { node } = entry
	const isOpenBranch = Boolean(node.children?.length) && tree.expandedSet.value.has(node.id)
	if (isOpenBranch && !node.isDisabled) tree.toggleNode(node.id)
	else focusNode(entry.parentId ?? undefined)
}

function createTreeKeys(
	tree: ReturnType<typeof useTreeModel>,
	headers: ReturnType<typeof useHeaders>,
	typeahead: ReturnType<typeof useTreeTypeahead>,
): Map<string, (at: { visible: VisibleNode[]; index: number; entry: VisibleNode }) => void> {
	const { focusNode } = headers
	return new Map<string, (at: { visible: VisibleNode[]; index: number; entry: VisibleNode }) => void>([
		['ArrowDown', ({ visible, index }) => focusNode(visible[index + 1]?.node.id)],
		['ArrowUp', ({ visible, index }) => focusNode(visible[index - 1]?.node.id)],
		['Home', ({ visible }) => focusNode(visible[0].node.id)],
		['End', ({ visible }) => focusNode(visible[visible.length - 1].node.id)],
		['ArrowRight', ({ entry }) => arrowRight(entry, tree, focusNode)],
		['ArrowLeft', ({ entry }) => arrowLeft(entry, tree, focusNode)],
		[
			'*',
			({ visible, entry }) =>
				tree.expandNodes(
					visible
						.filter(
							({ parentId, node: sibling }) => parentId === entry.parentId && sibling.children?.length && !sibling.isDisabled,
						)
						.map(({ node: sibling }) => sibling.id),
				),
		],
		['Enter', ({ entry }) => headers.activate(entry)],
		[' ', ({ entry }) => (typeahead.isTyping() ? typeahead.handleTypeahead(' ') : headers.headers.get(entry.node.id)?.click())],
	])
}

export function useBaseTree(props: TreeProps, emit: BaseTreeEmits) {
	const standard = useStandardBaseComponent('base-tree', props, TREE_ELEMENTS)
	const tree = useTreeModel(props, emit)
	const visibleNodes = computed((): VisibleNode[] => collectVisible(props.items ?? [], tree.expandedSet.value))
	const tab = useTabbable(visibleNodes, tree)
	const virtual = useTreeVirtual(props, visibleNodes, tab.tabbableIndex)
	const headers = useHeaders(props, visibleNodes, virtual.scrollToIndex)
	const typeahead = useTreeTypeahead(visibleNodes, tab.currentIndex, headers.focusNode)
	const keys = createTreeKeys(tree, headers, typeahead)
	provideTreeContext(props, tree, { classes: standard.classes, tab, headers })

	return {
		...standard,
		visibleNodes,
		rootRef: virtual.rootRef,
		virtualStyle: virtual.virtualStyle,
		virtualItems: virtual.items,
		totalSize: virtual.totalSize,
		measureElement: virtual.measureElement,
		handleKeydown(event: KeyboardEvent): void {
			const visible = visibleNodes.value
			const index = tab.currentIndex()
			const entry = visible[index]
			if (!entry || event.target !== headers.headers.get(entry.node.id)) return
			const action = keys.get(event.key)
			if (action) action({ visible, index, entry })
			else {
				if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return
				typeahead.handleTypeahead(event.key)
			}
			event.preventDefault()
		},
	}
}
