import type { ComputedRef, Ref } from 'vue'
import type { TreeIndex } from '@utils/navigation/treeUtils'
import type { BaseTreeEmits, TreeNode, TreeSelectionMode } from '@components/BaseTree/types/BaseTree.types'

export interface UseTreeStateOptions {
	/** Корневые узлы; `undefined` — пустое дерево */
	items: Ref<TreeNode[] | undefined>
	selectionMode: Ref<TreeSelectionMode>
	expandedIds: Ref<string[] | undefined>
	selectedIds: Ref<string[] | undefined>
	isDefaultExpandAll: Ref<boolean>
	emit: BaseTreeEmits
}

export interface UseTreeStateResult {
	expandedIds: ComputedRef<string[]>
	/** Выбранные id: в режиме multiple — согласованные снизу вверх, в single — не больше одного */
	selectedIds: ComputedRef<string[]>
	expandedSet: ComputedRef<Set<string>>
	/** Множество выбранных id для O(1) проверки */
	selectedSet: ComputedRef<Set<string>>
	/** Узлы с частичным выбором в режиме multiple: выбрана часть доступных потомков */
	indeterminateSet: ComputedRef<Set<string>>
	/** Корневые узлы без повторных id (дубль на корне или узел, уже встреченный потомком) */
	roots: ComputedRef<TreeNode[]>
	/** Дети узла без повторных id (цикл в children или дубль) */
	childrenOf: (node: TreeNode) => TreeNode[]
	toggleNode: (id: string) => void
	/** Раскрыть несколько узлов разом */
	expandNodes: (ids: string[]) => void
	/** Переключить выбор узла; отключённый узел не выбирается, в режиме multiple — с каскадом */
	selectNode: (id: string) => void
}

/** Внутреннее состояние useTreeState, общее для раскрытия и выбора узлов */
export interface TreeStateContext {
	internalExpandedIds: Ref<string[]>
	internalSelectedIds: Ref<string[]>
	/** Индекс дерева: узлы и родители по id, порядок обхода, повторные id */
	index: ComputedRef<TreeIndex>
	expandedIds: ComputedRef<string[]>
	/** Выбор из пропа или внутренний — как передан */
	rawSelectedIds: ComputedRef<string[]>
	selectedIds: ComputedRef<string[]>
	expandedSet: ComputedRef<Set<string>>
	selectedSet: ComputedRef<Set<string>>
	indeterminateSet: ComputedRef<Set<string>>
}
