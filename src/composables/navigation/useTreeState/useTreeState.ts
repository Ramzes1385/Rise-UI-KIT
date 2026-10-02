/** Composable: состояние дерева (expand/collapse, выбор с каскадом, индекс узлов) */
import { warn } from '@/locales/warn'
import { computed, ref, watch } from 'vue'
import { UI_WARNINGS } from '@/locales/messages'
import { createTreeExpansion } from './useTreeStateExpansion'
import { createTreeSelection } from './useTreeStateSelection'
import type { TreeIndex, TreeSelectionState } from '@utils/navigation/treeUtils'
import type { TreeSelectionMode } from '@components/BaseTree/types/BaseTree.types'
import type { TreeStateContext, UseTreeStateOptions, UseTreeStateResult } from './types/useTreeState.types'
import { buildTreeIndex, collectExpandableIds, getTreeChildren, normalizeTreeSelection } from '@utils/navigation/treeUtils'

const REPEATED_IDS_SHOWN = 5

/** Выбор для отображения: multiple — согласован снизу вверх, single — не больше одного id, none — как передан */
function resolveSelection(mode: TreeSelectionMode, index: TreeIndex, ids: string[]): TreeSelectionState {
	if (mode === 'multiple') return normalizeTreeSelection(index, ids)
	return { selected: mode === 'single' ? ids.slice(0, 1) : ids, indeterminate: new Set() }
}

/** Внутренние списки и производные от них: проп (контролируемый режим) важнее внутреннего значения */
function createTreeStateContext(options: UseTreeStateOptions): TreeStateContext {
	const { items, selectionMode, expandedIds: propExpandedIds, selectedIds: propSelectedIds } = options
	const internalExpandedIds = ref<string[]>([])
	const internalSelectedIds = ref<string[]>([])
	const index = computed(() => buildTreeIndex(items.value ?? []))
	const expandedIds = computed(() => propExpandedIds.value ?? internalExpandedIds.value)
	const rawSelectedIds = computed(() => propSelectedIds.value ?? internalSelectedIds.value)
	const selection = computed(() => resolveSelection(selectionMode.value, index.value, rawSelectedIds.value))
	const selectedIds = computed(() => selection.value.selected)

	return {
		internalExpandedIds,
		internalSelectedIds,
		index,
		expandedIds,
		rawSelectedIds,
		selectedIds,
		expandedSet: computed(() => new Set(expandedIds.value)),
		selectedSet: computed(() => new Set(selectedIds.value)),
		indeterminateSet: computed(() => selection.value.indeterminate),
	}
}

/** Предупреждение о повторных id: цикл в children или дубль; такие вхождения не показываются */
function watchRepeatedIds(context: TreeStateContext): void {
	watch(
		context.index,
		function warnRepeated({ repeated }): void {
			if (!repeated.length) return
			warn(UI_WARNINGS.TREE_REPEATED_ID, { ids: [...new Set(repeated)].slice(0, REPEATED_IDS_SHOWN).join(', ') })
		},
		{ immediate: true },
	)
}

/** isDefaultExpandAll: при включении раскрыть всё, при новых узлах — раскрыть только новые id, ручное сворачивание не трогать */
function watchDefaultExpandAll(options: UseTreeStateOptions, context: TreeStateContext): void {
	const { items, isDefaultExpandAll, emit } = options
	const { internalExpandedIds, expandedIds, expandedSet } = context
	const knownIds = new Set<string>()

	watch(
		[isDefaultExpandAll, context.index],
		function expandAll([isAll], previous): void {
			const wasAll = previous?.[0] === true
			const expandable = collectExpandableIds(items.value ?? [])
			const fresh = isAll && !wasAll ? expandable : expandable.filter(id => !knownIds.has(id))
			for (const id of expandable) knownIds.add(id)
			const toExpand = isAll ? fresh.filter(id => !expandedSet.value.has(id)) : []
			if (!toExpand.length) return
			const next = [...expandedIds.value, ...toExpand]
			internalExpandedIds.value = next
			emit('update:expandedIds', next)
		},
		{ immediate: true },
	)
}

/** Смена режима на single оставляет не больше одного выбранного id */
function watchSelectionMode(options: UseTreeStateOptions, context: TreeStateContext): void {
	watch(options.selectionMode, function trimToSingle(mode): void {
		const ids = context.rawSelectedIds.value
		if (mode !== 'single' || ids.length < 2) return
		const next = ids.slice(0, 1)
		context.internalSelectedIds.value = next
		options.emit('update:selectedIds', next)
	})
}

/** Режимы выбора none/single/multiple; в multiple — каскад и частичный выбор */
function useTreeState(options: UseTreeStateOptions): UseTreeStateResult {
	const context = createTreeStateContext(options)
	const { expandedIds, selectedIds, expandedSet, selectedSet, indeterminateSet, index } = context

	const { toggleNode, expandNodes } = createTreeExpansion(context, options.emit)
	const { selectNode } = createTreeSelection(context, options)

	watchRepeatedIds(context)
	watchDefaultExpandAll(options, context)
	watchSelectionMode(options, context)

	return {
		expandedIds,
		selectedIds,
		expandedSet,
		selectedSet,
		indeterminateSet,
		childrenOf: node => getTreeChildren(index.value, node),
		toggleNode,
		expandNodes,
		selectNode,
	}
}

export { useTreeState }
