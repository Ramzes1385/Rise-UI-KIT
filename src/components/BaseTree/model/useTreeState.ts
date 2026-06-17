import { computed, ref, watch } from 'vue'
import { buildDescendantsCache, collectExpandableIds } from './BaseTree.utils'
import type { BaseTreeEmits, TreeNode, TreeSelectionMode } from './BaseTree.types'
import type { ComputedRef, Ref } from 'vue'

interface UseTreeStateOptions {
	items: Ref<TreeNode[]>
	selectionMode: Ref<TreeSelectionMode>
	expandedIds: Ref<string[] | undefined>
	selectedIds: Ref<string[] | undefined>
	isDefaultExpandAll: Ref<boolean>
	emit: BaseTreeEmits
}

interface UseTreeStateResult {
	expandedIds: ComputedRef<string[]>
	selectedIds: ComputedRef<string[]>
	expandedSet: ComputedRef<Set<string>>
	selectedSet: ComputedRef<Set<string>>
	toggleNode: (id: string) => void
	selectNode: (id: string) => void
}

/**
 * Внутренний composable для управления состоянием дерева (раскрытие и выбор узлов).
 */
export function useTreeState(options: UseTreeStateOptions): UseTreeStateResult {
	const {
		items,
		selectionMode,
		expandedIds: propExpandedIds,
		selectedIds: propSelectedIds,
		isDefaultExpandAll,
		emit,
	} = options

	const internalExpandedIds = ref<string[]>([])
	const internalSelectedIds = ref<string[]>([])
	const descendantsCache = new Map<string, string[]>()

	const expandedIds = computed(function getExpandedIds(): string[] {
		return propExpandedIds.value ?? internalExpandedIds.value
	})

	const selectedIds = computed(function getSelectedIds(): string[] {
		return propSelectedIds.value ?? internalSelectedIds.value
	})

	const expandedSet = computed(function getExpandedSet(): Set<string> {
		return new Set(expandedIds.value)
	})

	const selectedSet = computed(function getSelectedSet(): Set<string> {
		return new Set(selectedIds.value)
	})

	function toggleNode(id: string): void {
		const current = [...expandedIds.value]
		const pos = current.indexOf(id)
		const isExpanded = pos > -1

		if (isExpanded) {
			current.splice(pos, 1)
		} else {
			current.push(id)
		}

		internalExpandedIds.value = current
		emit('update:expandedIds', current)
		emit('toggle', id, !isExpanded)
	}

	function handleSingleSelection(id: string, isSelected: boolean): void {
		const newIds = isSelected ? [] : [id]
		internalSelectedIds.value = newIds
		emit('update:selectedIds', newIds)
		emit('select', id, !isSelected)
	}

	function handleCascadeSelection(id: string, isSelected: boolean): void {
		const current = [...selectedIds.value]
		const descendantIds = descendantsCache.get(id) ?? []
		const affectedIds = [id, ...descendantIds]
		const affectedSet = new Set(affectedIds)

		let newIds: string[]
		if (isSelected) {
			newIds = current.filter(function isNotAffected(i): boolean {
				return !affectedSet.has(i)
			})
		} else {
			newIds = [...new Set([...current, ...affectedIds])]
		}

		internalSelectedIds.value = newIds
		emit('update:selectedIds', newIds)
		emit('select', id, !isSelected)
	}

	function selectNode(id: string): void {
		const mode = selectionMode.value
		if (mode === 'none') {
			return
		}

		const isSelected = selectedSet.value.has(id)
		if (mode === 'single') {
			handleSingleSelection(id, isSelected)
		} else {
			handleCascadeSelection(id, isSelected)
		}
	}

	watch(
		items,
		function updateCache(nodes): void {
			descendantsCache.clear()
			buildDescendantsCache(nodes, descendantsCache)
		},
		{ immediate: true },
	)

	watch(
		isDefaultExpandAll,
		function expandAll(isAll: boolean): void {
			if (isAll) {
				const allIds = collectExpandableIds(items.value)
				internalExpandedIds.value = allIds
				emit('update:expandedIds', allIds)
			}
		},
		{ immediate: true },
	)

	return {
		expandedIds,
		selectedIds,
		expandedSet,
		selectedSet,
		toggleNode,
		selectNode,
	}
}
