import type { BaseComponentProps } from '../../../types/base.types'
import type { ComputedRef, InjectionKey, Ref } from 'vue'

/** Режим выбора в дереве */
export type TreeSelectionMode = 'none' | 'single' | 'multiple'

/** Позиция стрелки раскрытия */
export type TreeArrowPosition = 'left' | 'right'

/** Варианты отображения дерева */
export const TREE_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Узел дерева
 */
export interface TreeNode {
	/** Уникальный идентификатор */
	id: string
	/** Заголовок узла */
	label: string
	/** Иконка (имя из спрайта) */
	icon?: string
	/** Дочерние узлы */
	children?: TreeNode[]
	/** Отключен ли узел */
	isDisabled?: boolean
	/** Ссылка маршрута */
	to?: string
	/** Внешняя ссылка */
	href?: string
}

/**
 * Контекст дерева для provide/inject
 */
export interface TreeContext {
	/** Режим выбора */
	selectionMode: Ref<TreeSelectionMode>
	/** Позиция стрелки */
	arrowPosition: Ref<TreeArrowPosition>
	/** Раскрытые идентификаторы */
	expandedIds: Ref<string[]>
	/** Выбранные идентификаторы */
	selectedIds: Ref<string[]>
	/** Множество раскрытых id для O(1) проверки */
	expandedSet: Ref<Set<string>>
	/** Множество выбранных id для O(1) проверки */
	selectedSet: Ref<Set<string>>
	/** Переключить раскрытие узла */
	toggleNode: (id: string) => void
	/** Выбрать/отменить выбор узла */
	selectNode: (id: string) => void
	/** Кастомные классы */
	classes: ComputedRef<Record<string, string | undefined>>
}

/** Ключ для provide/inject контекста дерева */
export const TREE_CONTEXT_KEY: InjectionKey<TreeContext> = Symbol('tree-context')

/**
 * Пропсы компонента BaseTree
 */
export interface BaseTreeProps extends BaseComponentProps<(typeof TREE_VARIANTS)[number], 'root' | 'node' | 'header' | 'arrow' | 'checkbox' | 'icon' | 'label' | 'actions' | 'children'> {
	/** Корневые узлы дерева */
	items: TreeNode[]
	/** Режим выбора */
	selectionMode?: TreeSelectionMode
	/** Позиция стрелки раскрытия */
	arrowPosition?: TreeArrowPosition
	/** v-model раскрытых узлов */
	expandedIds?: string[]
	/** v-model выбранных узлов */
	selectedIds?: string[]
	/** Раскрыть все узлы по умолчанию */
	isDefaultExpandAll?: boolean
}

/**
 * События компонента BaseTree
 */
export interface BaseTreeEmits {
	(event: 'update:expandedIds', value: string[]): void
	(event: 'update:selectedIds', value: string[]): void
	(event: 'toggle', nodeId: string, isExpanded: boolean): void
	(event: 'select', nodeId: string, isSelected: boolean): void
}

/**
 * Слоты компонента BaseTree
 */
export interface BaseTreeSlots {
	/** Кастомная иконка узла */
	icon?: (props: { node: TreeNode }) => unknown
	/** Кастомная стрелка раскрытия */
	arrow?: (props: { node: TreeNode; isExpanded: boolean }) => unknown
	/** Кастомное содержимое метки узла */
	label?: (props: { node: TreeNode; depth: number; isSelected: boolean; isExpanded: boolean }) => unknown
	/** Действия справа от узла */
	actions?: (props: { node: TreeNode }) => unknown
}
