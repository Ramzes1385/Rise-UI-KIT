import type { TreeSelectRow } from './BaseTreeSelect.types'
import type { TreeNode } from '@components/BaseTree/types/BaseTree.types'

/**
 * Пропсы выпадающей панели BaseTreeSelect: поиск, дерево, загрузка и пустое состояние
 */
export interface BaseTreeSelectPanelProps {
	/** Видимые строки дерева */
	rows: TreeSelectRow[]
	/** Показывать поиск */
	isSearchable: boolean
	/** Флажки и `aria-checked` вместо `aria-selected` */
	isMultiple: boolean
	/** Узлы загружаются */
	isLoading: boolean
	/** Масштаб размера */
	sizeScale: number
	/** Выбранные id */
	selectedSet: Set<string>
	/** id с частичным выбором */
	indeterminateSet: Set<string>
	/** Объект CSS-классов для кастомизации элементов */
	classes: Record<string, string | undefined>
	/** CSS-стили масштабирования */
	sizeScaleStyle: Record<string, string> | undefined
	/** id дерева (`role="tree"`): на него ссылается `aria-controls` поля */
	treeId: string
	/** id того, чем управляет поле (`aria-controls`): дерево, а без строк — сама панель (`<treeId>-panel`) */
	popupId: string
	/** id подписи поля — имя дерева; без подписи имя берётся из `treeLabel` */
	labelledby?: string
	/** Имя дерева, если подписи нет */
	treeLabel?: string
	/** Индекс активной строки; -1 — нет */
	activeIndex: number
	/** id строки по индексу — для `aria-activedescendant` */
	getRowId: (index: number) => string
}

/**
 * События панели
 */
export interface BaseTreeSelectPanelEmits {
	/** Клик по строке */
	(event: 'select', row: TreeSelectRow): void
	/** Клик по стрелке раскрытия */
	(event: 'toggle', row: TreeSelectRow): void
	/** Указатель над строкой — она становится активной */
	(event: 'activate', index: number): void
	/** Клавиши в поле поиска */
	(event: 'search-keydown', value: KeyboardEvent): void
}

/**
 * Слоты панели
 */
export interface BaseTreeSelectPanelSlots {
	/** Подпись узла */
	node?: (props: { node: TreeNode; isSelected: boolean; depth: number }) => unknown
	/** Пустой список */
	empty?: () => unknown
}
