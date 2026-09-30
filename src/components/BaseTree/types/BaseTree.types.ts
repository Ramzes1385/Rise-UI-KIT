import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export type TreeSelectionMode = 'none' | 'single' | 'multiple'

export type TreeArrowPosition = 'left' | 'right'

export const TREE_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

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
	/** Маршрут приложения: подпись узла — ссылка (BaseLink), Enter переходит по ней */
	to?: string
	/** Внешний адрес: подпись узла — ссылка (BaseLink) */
	href?: string
	/** Target ссылки */
	target?: '_blank' | '_self'
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
	/** tabindex узла: 0 — у одного узла дерева (roving tabindex), у остальных -1 */
	tabIndexOf: (id: string) => number
	/** Узел получил фокус: стрелки продолжат от него */
	setActive: (id: string) => void
	/** Элемент заголовка узла (treeitem) — для перевода фокуса с клавиатуры */
	registerHeader: (id: string, element: HTMLElement) => void
	/** Снять регистрацию; элемент сверяется — узел с тем же id мог уже смонтироваться в другом месте дерева */
	unregisterHeader: (id: string, element: HTMLElement) => void
}

export const TREE_CONTEXT_KEY: InjectionKey<TreeContext> = Symbol('tree-context')

export interface BaseTreeProps extends BaseComponentProps<
	(typeof TREE_VARIANTS)[number],
	'root' | 'node' | 'header' | 'arrow' | 'checkbox' | 'icon' | 'label' | 'actions' | 'children'
> {
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
	/** Имя дерева для скринридера, например «Файлы проекта» */
	ariaLabel?: string
	/**
	 * Виртуальная прокрутка для деревьев на тысячи видимых узлов: в DOM только видимые узлы и запас, дерево —
	 * плоский список treeitem с aria-level, aria-setsize и aria-posinset. Работает вместе с `height`
	 */
	isVirtual?: boolean
	/** Высота области дерева при `isVirtual`: число — в пикселях, строка — любая CSS-длина */
	height?: number | string
	/** Высота узла до замера при `isVirtual`, px */
	itemSize?: number
}

export interface BaseTreeEmits {
	(event: 'update:expandedIds', value: string[]): void
	(event: 'update:selectedIds', value: string[]): void
	(event: 'toggle', nodeId: string, isExpanded: boolean): void
	(event: 'select', nodeId: string, isSelected: boolean): void
}

export interface BaseTreeSlots {
	/** Кастомная иконка узла */
	icon?: (props: { node: TreeNode }) => unknown
	/** Кастомная стрелка раскрытия */
	arrow?: (props: { node: TreeNode; isExpanded: boolean }) => unknown
	/** Кастомное содержимое метки узла */
	label?: (props: { node: TreeNode; depth: number; isSelected: boolean; isExpanded: boolean }) => unknown
	/** Метка одного узла по его `id`: `label-docs` — узел `docs`, на любой глубине; у остальных — `label` */
	[name: `label-${string}`]: ((props: { node: TreeNode; depth: number; isSelected: boolean; isExpanded: boolean }) => unknown) | undefined
	/** Действия справа от узла */
	actions?: (props: { node: TreeNode }) => unknown
}

/** Видимый узел: раскрыты все его предки. Уровень и позиция — для плоского списка виртуальной прокрутки */
export interface VisibleNode {
	node: TreeNode
	parentId: string | null
	depth: number
	setSize: number
	posInSet: number
}

export type TreeProps = PropsWithDefaults<
	BaseTreeProps,
	'selectionMode' | 'arrowPosition' | 'isDefaultExpandAll' | 'isVirtual' | 'height' | 'itemSize'
>
