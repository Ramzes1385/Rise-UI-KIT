/** Composable: состояние дерева (expand/collapse, выбор, кэш потомков) */
import { computed, ref, watch } from 'vue'
import { createTreeExpansion } from './useTreeStateExpansion'
import { createTreeSelection } from './useTreeStateSelection'
import { buildDescendantsCache, collectExpandableIds } from '@utils/navigation/treeUtils'
import type { TreeStateContext, UseTreeStateOptions, UseTreeStateResult } from './types/useTreeState.types'

/** Внутренние списки и производные от них: проп (контролируемый режим) важнее внутреннего значения */
function createTreeStateContext(options: UseTreeStateOptions): TreeStateContext {
	const { expandedIds: propExpandedIds, selectedIds: propSelectedIds } = options

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

	return { internalExpandedIds, internalSelectedIds, descendantsCache, expandedIds, selectedIds, expandedSet, selectedSet }
}

/** Кэш потомков при смене узлов и раскрытие всего дерева по isDefaultExpandAll */
function watchTreeSources(options: UseTreeStateOptions, context: TreeStateContext): void {
	const { items, isDefaultExpandAll, emit } = options
	const { internalExpandedIds, descendantsCache } = context

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
}

/** Поддерживает режимы выбора single/multi/checkbox */
function useTreeState(options: UseTreeStateOptions): UseTreeStateResult {
	const context = createTreeStateContext(options)
	const { expandedIds, selectedIds, expandedSet, selectedSet } = context

	const { toggleNode, expandNodes } = createTreeExpansion(context, options.emit)
	const { selectNode } = createTreeSelection(context, options)

	watchTreeSources(options, context)

	return {
		expandedIds,
		selectedIds,
		expandedSet,
		selectedSet,
		toggleNode,
		expandNodes,
		selectNode,
	}
}

export { useTreeState }
