import type { BaseTreeEmits, TreeNode, TreeSelectionMode } from '@components/BaseTree/model/BaseTree.types'
import type { ComputedRef, Ref } from 'vue'

export interface UseTreeStateOptions {
	items: Ref<TreeNode[]>
	selectionMode: Ref<TreeSelectionMode>
	expandedIds: Ref<string[] | undefined>
	selectedIds: Ref<string[] | undefined>
	isDefaultExpandAll: Ref<boolean>
	emit: BaseTreeEmits
}

export interface UseTreeStateResult {
	expandedIds: ComputedRef<string[]>
	selectedIds: ComputedRef<string[]>
	expandedSet: ComputedRef<Set<string>>
	selectedSet: ComputedRef<Set<string>>
	toggleNode: (id: string) => void
	selectNode: (id: string) => void
}
