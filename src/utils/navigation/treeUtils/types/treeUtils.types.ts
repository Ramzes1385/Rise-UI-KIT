import type { TreeNode } from '@components/BaseTree/types/BaseTree.types'

/** Индекс дерева: один обход без рекурсии, повторный id (цикл в children или дубль) учтён только первый раз */
export interface TreeIndex {
	/** Узел по id — первое вхождение */
	nodes: Map<string, TreeNode>
	/** id родителя по id узла; у корневых узлов записи нет */
	parents: Map<string, string>
	/** id в порядке обхода в глубину: родитель раньше потомков */
	order: string[]
	/** id, встреченные повторно: такие вхождения пропущены вместе с поддеревом */
	repeated: string[]
}

/** Выбор в режиме multiple, согласованный снизу вверх */
export interface TreeSelectionState {
	/** Выбранные id: выбран узел — выбраны его доступные потомки; выбраны все доступные дети — выбран родитель */
	selected: string[]
	/** Узлы с частичным выбором: выбрана часть доступных потомков; в `selected` их нет */
	indeterminate: Set<string>
}

/** Шаг обхода: узел и id его родителя (у корневых — `undefined`) */
export type TreeWalkVisit = (node: TreeNode, parentId: string | undefined) => void

/** Элемент стека обхода: узел и id его родителя */
export type TreeWalkEntry = readonly [TreeNode, string | undefined]
