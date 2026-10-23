import type { ComputedRef, Ref } from 'vue'
import type { UiProp } from '@composables/base/useUi'
import type { TreeIndex } from '@utils/navigation/treeUtils'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { FieldInputAttrs } from '@composables/form/useFormContext'
import type { TreeNode } from '@components/BaseTree/types/BaseTree.types'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления поля — как у BaseSelect: default — рамка; ghost — без рамки и фона; outline — без фона;
 * shadow — с тенью; soft — мягкий фон без рамки; underline — только нижняя линия
 */
export const TREE_SELECT_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft', 'underline'] as const

/**
 * Что попадает в значение при `isMultiple` (выбор с каскадом): `child` — выбранные узлы без выбранных детей
 * (листья и узлы, у которых дети не выбраны); `parent` — выбранные узлы без выбранного родителя (полностью
 * выбранная ветка — одним id); `all` — все выбранные узлы, как `selectedIds` у BaseTree
 */
export const TREE_SELECT_CHECKED_STRATEGIES = ['child', 'parent', 'all'] as const

export type TreeSelectCheckedStrategy = (typeof TREE_SELECT_CHECKED_STRATEGIES)[number]

export type TreeSelectValue = string | string[]

/**
 * Части BaseTreeSelect для пропа `ui` (БЭМ-элементы `.base-tree-select__<часть>`, `root` — поле с подписью и ошибкой):
 * dropdown — обёртка выпадающей панели, label, required, trigger — поле, values, tag, tag-text, tag-close, more — метка
 * «+N», placeholder, value-text, arrow, error-text; панель: panel, search, search-input, status — загрузка и пустое
 * состояние, tree — список, node — строка узла, toggle — стрелка раскрытия, checkbox, icon, node-label, check — галочка.
 */
export const TREE_SELECT_PARTS = [
	'dropdown',
	'label',
	'required',
	'trigger',
	'values',
	'tag',
	'tag-text',
	'tag-close',
	'more',
	'placeholder',
	'value-text',
	'arrow',
	'error-text',
	'panel',
	'search',
	'search-input',
	'status',
	'tree',
	'node',
	'toggle',
	'checkbox',
	'icon',
	'node-label',
	'check',
] as const

export type BaseTreeSelectPart = (typeof TREE_SELECT_PARTS)[number]

type TreeSelectElement =
	| 'root'
	| 'dropdown'
	| 'label'
	| 'required'
	| 'trigger'
	| 'values'
	| 'tag'
	| 'tagText'
	| 'tagClose'
	| 'more'
	| 'placeholder'
	| 'valueText'
	| 'arrow'
	| 'errorText'
	| 'panel'
	| 'search'
	| 'searchInput'
	| 'tree'
	| 'node'
	| 'toggle'
	| 'checkbox'
	| 'icon'
	| 'nodeLabel'
	| 'status'

/**
 * Пропсы BaseTreeSelect
 */
export interface BaseTreeSelectProps extends BaseComponentProps<(typeof TREE_SELECT_VARIANTS)[number], TreeSelectElement> {
	/**
	 * Выбранное значение (v-model): id узла при одиночном выборе (`''` — ничего не выбрано), массив id при `isMultiple`.
	 * При `isMultiple` можно передать id в любом виде (`child`, `parent`, `all`): выбор согласуется каскадом
	 */
	modelValue?: TreeSelectValue
	/** Узлы дерева — тот же формат, что у BaseTree (`id`, `label`, `icon`, `children`, `isDisabled`); id уникальны */
	items: TreeNode[]
	/** Плейсхолдер */
	placeholder?: string
	/** Заголовок поля */
	label?: string
	/** Имя поля без видимой подписи (`aria-label` триггера); без него имя — плейсхолдер */
	ariaLabel?: string
	/** Атрибуты триггера (`role="combobox"`): `aria-*`, `data-*`; `id` — свой id триггера, `aria-describedby` добавляется к описаниям кита */
	triggerAttrs?: FieldInputAttrs
	/** Обязательное поле */
	isRequired?: boolean
	/**
	 * Несколько значений: флажки с каскадом — узел выбирает доступных потомков, выбор всех доступных детей выбирает
	 * родителя, часть — частичный выбор (`aria-checked="mixed"`). Отключённые узлы и их ветки в каскаде не участвуют
	 */
	isMultiple?: boolean
	/** Что попадает в значение при `isMultiple` — см. `TREE_SELECT_CHECKED_STRATEGIES` */
	checkedStrategy?: TreeSelectCheckedStrategy
	/** Сколько меток показывать в поле при `isMultiple`; остальные — счётчиком «+N». Без значения — все */
	maxTagCount?: number
	/**
	 * Поиск по подписям узлов: поле поиска в выпадающем списке, видны совпавшие узлы, их предки (раскрыты) и потомки.
	 * Пока в поиске есть текст, стрелки влево и вправо, Home и End двигают курсор в поле, а не управляют деревом
	 */
	isSearchable?: boolean
	/** Раскрыть все узлы по умолчанию */
	isDefaultExpandAll?: boolean
	/** Узлы загружаются: в списке — «Загрузка...» (`role="status"`), дерево не показывается */
	isLoading?: boolean
	/** Отключенное состояние */
	isDisabled?: boolean
	/** Текст ошибки */
	error?: string
	/**
	 * Классы частей поля и панели (`root`, `trigger`, `panel`, `tree`, `node`… — см. `TREE_SELECT_PARTS`) — добавляются
	 * к классам кита. Глобально — `defaults.BaseTreeSelect.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BaseTreeSelect :items="tree" :ui="{ trigger: 'ring-1', node: 'rounded-none' }" />
	 */
	ui?: UiProp<BaseTreeSelectPart>
}

/**
 * События BaseTreeSelect
 */
export interface BaseTreeSelectEmits {
	/** Новое значение: id или массив id (вид массива — `checkedStrategy`) */
	(event: 'update:modelValue', value: TreeSelectValue): void
	/** То же значение после выбора пользователем */
	(event: 'change', value: TreeSelectValue): void
	/** Раскрытие или сворачивание узла в списке */
	(event: 'toggle', nodeId: string, isExpanded: boolean): void
}

/**
 * Слоты BaseTreeSelect
 */
export interface BaseTreeSelectSlots {
	/** Подпись узла в списке: `node`, отмечен ли он (`isSelected`) и уровень (`depth`, с 0) */
	node?: (props: { node: TreeNode; isSelected: boolean; depth: number }) => unknown
	/** Выбранный узел в поле при одиночном выборе */
	selected?: (props: { node: TreeNode }) => unknown
	/** Выбранные значения при `isMultiple` вместо меток; `remove(id)` снимает выбор узла с каскадом */
	tag?: (props: { nodes: TreeNode[]; remove: (id: string) => void }) => unknown
	/** Содержимое списка, когда узлов нет или поиск ничего не нашёл */
	empty?: () => unknown
}

/**
 * Видимая строка дерева в списке
 */
export interface TreeSelectRow {
	/** Узел */
	node: TreeNode
	/** id родителя; у корневых — `null` */
	parentId: string | null
	/** Уровень, с 0 */
	depth: number
	/** Число видимых узлов этого уровня у того же родителя */
	setSize: number
	/** Позиция среди них, с 1 */
	posInSet: number
	/** Есть видимые дети */
	hasChildren: boolean
	/** Ветка раскрыта */
	isExpanded: boolean
}

export type TreeSelectProps = PropsWithDefaults<
	BaseTreeSelectProps,
	'modelValue' | 'isRequired' | 'isMultiple' | 'checkedStrategy' | 'isSearchable' | 'isDefaultExpandAll' | 'isLoading' | 'isDisabled'
>

/** Источник строк: корни и дети без повторных id, раскрытые узлы, индекс дерева и строка поиска */
export interface TreeSelectRowsSource {
	roots: TreeNode[]
	childrenOf: (node: TreeNode) => TreeNode[]
	expandedSet: Set<string>
	index: TreeIndex
	query: string
}

/** Найденное поиском: совпавшие узлы и их предки (раскрываются принудительно) */
export interface TreeSelectSearchScope {
	matches: Set<string>
	ancestors: Set<string>
}

/** Уровень обхода при построении строк: родитель, глубина и лежит ли уровень внутри совпавшей ветки */
export interface TreeSelectRowsLevel {
	parentId: string | null
	depth: number
	isUnderMatch: boolean
}

/** Состояние и действия, нужные клавиатуре поля и поиска */
export interface TreeSelectKeysContext {
	isOpen: Ref<boolean>
	searchQuery: Ref<string>
	rows: ComputedRef<TreeSelectRow[]>
	activeIndex: ComputedRef<number>
	isDisabled: () => boolean
	open: () => void
	close: () => void
	moveTo: (index: number) => void
	selectRow: (row: TreeSelectRow) => void
	toggleRow: (row: TreeSelectRow) => void
}

/** Действие клавиши при открытом списке; `row` — активная строка */
export type TreeSelectKeyAction = (context: TreeSelectKeysContext, row: TreeSelectRow | undefined) => void
