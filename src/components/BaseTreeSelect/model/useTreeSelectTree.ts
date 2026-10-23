import type { Ref } from 'vue'
import { computed, ref, toRef } from 'vue'
import { buildTreeSelectRows } from './treeSelectRows'
import { buildTreeIndex } from '@utils/navigation/treeUtils'
import { useTreeState } from '@composables/navigation/useTreeState'
import type { TreeNode } from '@components/BaseTree/types/BaseTree.types'
import type { BaseTreeEmits } from '@components/BaseTree/types/BaseTree.types'
import { applyCheckedStrategy, sortByTreeOrder, toSelectedIds } from './treeSelectValue'
import type { BaseTreeSelectEmits, TreeSelectProps, TreeSelectValue } from '../types/BaseTreeSelect.types'

function createTreeEmit(onSelectedIds: (ids: string[]) => void, emit: BaseTreeSelectEmits): BaseTreeEmits {
	return ((event: string, first: string[] | string, second?: boolean) => {
		if (event === 'update:selectedIds') onSelectedIds(first as string[])
		else if (event === 'toggle') emit('toggle', first as string, second as boolean)
	}) as BaseTreeEmits
}

export function useTreeSelectTree(props: TreeSelectProps, emit: BaseTreeSelectEmits, searchQuery: Ref<string>) {
	const index = computed(() => buildTreeIndex(props.items))
	const toValue = (ids: string[]): string[] => sortByTreeOrder(index.value, applyCheckedStrategy(index.value, ids, props.checkedStrategy))
	const emitValue = (value: TreeSelectValue): void => {
		emit('update:modelValue', value)
		emit('change', value)
	}
	const tree = useTreeState({
		items: toRef(props, 'items'),
		selectionMode: computed(() => (props.isMultiple ? 'multiple' : 'single')),
		expandedIds: ref<string[] | undefined>(undefined),
		selectedIds: computed(() => toSelectedIds(props.modelValue, props.isMultiple)),
		isDefaultExpandAll: toRef(props, 'isDefaultExpandAll'),
		emit: createTreeEmit(ids => emitValue(toValue(ids)), emit),
	})
	const rows = computed(() =>
		buildTreeSelectRows({
			roots: tree.roots.value,
			childrenOf: tree.childrenOf,
			expandedSet: tree.expandedSet.value,
			index: index.value,
			query: searchQuery.value,
		}),
	)
	const valueNodes = computed((): TreeNode[] =>
		toValue(tree.selectedIds.value)
			.map(id => index.value.nodes.get(id))
			.filter((node): node is TreeNode => Boolean(node)),
	)

	return { index, tree, rows, valueNodes, emitValue }
}
