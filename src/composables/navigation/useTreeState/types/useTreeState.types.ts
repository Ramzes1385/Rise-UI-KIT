import type { ComputedRef, Ref } from 'vue'
import type { BaseTreeEmits, TreeNode, TreeSelectionMode } from '@components/BaseTree/types/BaseTree.types'

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
	/** Раскрыть несколько узлов разом */
	expandNodes: (ids: string[]) => void
	selectNode: (id: string) => void
}
