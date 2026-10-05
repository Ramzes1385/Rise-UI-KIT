import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { TreeIndex } from '@utils/navigation/treeUtils'
import type { UiClassFn, UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { FieldInputAttrs } from '@composables/form/useFormContext'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты поля BaseCascader — как у BaseSelect: default — рамка; outline — рамка без фона; soft — мягкий фон без рамки;
 * ghost — без фона и рамки до наведения; shadow — рамка и тень; underline — только нижняя линия
 */
export const CASCADER_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft', 'underline'] as const

type CascaderVariant = (typeof CASCADER_VARIANTS)[number]

/**
 * Части BaseCascader для пропа `ui` (БЭМ-элементы `.base-cascader__<часть>`, `root` — поле с подписью и ошибкой):
 * dropdown — обёртка выпадающей панели, label, required, trigger — поле, values — значения в поле, tag, tag-text,
 * tag-close, placeholder, value-text, arrow, error-text; панель: panel, search, search-input, columns — ряд колонок,
 * column — колонка уровня, options — список уровня, option — строка узла, results — результаты поиска, status, empty.
 */
export const CASCADER_PARTS = [
	'dropdown',
	'label',
	'required',
	'trigger',
	'values',
	'tag',
	'tag-text',
	'tag-close',
	'placeholder',
	'value-text',
	'arrow',
	'error-text',
	'panel',
	'search',
	'search-input',
	'columns',
	'column',
	'options',
	'option',
	'results',
	'status',
	'empty',
] as const

export type BaseCascaderPart = (typeof CASCADER_PARTS)[number]

export interface BaseCascaderNode {
	/** Уникальный во всём дереве идентификатор */
	id: string
	/** Подпись узла */
	label: string
	/** Дополнительное описание под подписью */
	description?: string
	/** Значок перед подписью (имя из спрайта BaseIcon) */
	icon?: string
	/** Дети — следующий уровень. Нет детей и есть `load` — уровень загружается при раскрытии узла */
	children?: BaseCascaderNode[]
	/** Узел — конечный: не раскрывается и не загружает детей через `load` */
	isLeaf?: boolean
	/** Узел отключён: не выбирается и не раскрывается */
	isDisabled?: boolean
}

/** Путь значения: id узлов от корня до выбранного */
export type CascaderPath = string[]

/** Значение поля: путь (одиночный выбор) или список путей (`isMultiple`) */
export type CascaderValue = CascaderPath | CascaderPath[]

/**
 * Загрузка уровня: промис детей узла (узел приходит с уже загруженными уровнями в `children`).
 * Отклонённый промис — ошибка уровня с кнопкой «Повторить»
 */
export type CascaderLoad = (node: BaseCascaderNode) => Promise<BaseCascaderNode[]>

/** Состояние колонки: `ready` — узлы есть, `loading` — уровень загружается, `error` — загрузка не удалась */
export type CascaderColumnStatus = 'ready' | 'loading' | 'error'

/** Колонка панели — один уровень иерархии */
export interface CascaderColumn {
	/** Номер уровня: 0 — корни */
	level: number
	/** Узел, чьих детей показывает колонка; у корневой — нет */
	parent?: BaseCascaderNode
	/** Узлы уровня */
	nodes: BaseCascaderNode[]
	status: CascaderColumnStatus
}

/** Найденный поиском узел: путь до него и подписи пути */
export interface CascaderSearchResult {
	node: BaseCascaderNode
	path: CascaderPath
	/** Подписи узлов пути от корня */
	labels: string[]
	/** На пути есть отключённый узел */
	isDisabled: boolean
}

/** Выбранный путь при `isMultiple`: ключ, путь и подпись для метки */
export interface CascaderTag {
	key: string
	path: CascaderPath
	text: string
}

export interface BaseCascaderProps extends BaseComponentProps<
	CascaderVariant,
	| 'root'
	| 'dropdown'
	| 'label'
	| 'required'
	| 'trigger'
	| 'values'
	| 'tag'
	| 'placeholder'
	| 'valueText'
	| 'arrow'
	| 'errorText'
	| 'panel'
	| 'search'
	| 'columns'
	| 'column'
	| 'option'
	| 'results'
	| 'status'
	| 'empty'
> {
	/**
	 * Выбранное значение: путь id от корня до узла (`['ru', 'msk', 'tverskoy']`), при `isMultiple` — список путей.
	 * Пустой массив — ничего не выбрано
	 */
	modelValue?: CascaderValue
	/** Корневые узлы. id уникальны во всём дереве: повторный id (цикл или дубль) не показывается */
	items: BaseCascaderNode[]
	/**
	 * Загрузка уровня по требованию: вызывается при раскрытии узла без `children` и без `isLeaf`, результат запоминается.
	 * Пока промис не выполнен, колонка показывает загрузку, при ошибке — текст и кнопку «Повторить»
	 */
	load?: CascaderLoad
	/** Корневой уровень ещё загружается (приложение получает `items`): колонка показывает загрузку, поле — `aria-busy` */
	isLoading?: boolean
	/** Можно выбрать узел любого уровня, а не только конечный: щелчок и Enter выбирают узел и раскрывают его */
	isAnyLevel?: boolean
	/** Несколько значений: флажки у выбираемых узлов, выбранные пути — метками в поле; панель не закрывается */
	isMultiple?: boolean
	/** Поле поиска в панели: ищет по подписям всех загруженных уровней и показывает найденные пути списком */
	isSearchable?: boolean
	/** Разделитель подписей пути в поле и в результатах поиска */
	separator?: string
	/** Подсказка в пустом поле */
	placeholder?: string
	/** Подпись поля */
	label?: string
	/** Имя поля без видимой подписи (`aria-label` поля); без него имя — подсказка */
	ariaLabel?: string
	/** Атрибуты поля (`role="combobox"`): `aria-*`, `data-*`; `id` — свой id, `aria-describedby` добавляется к описаниям кита */
	triggerAttrs?: FieldInputAttrs
	/** Обязательное поле */
	isRequired?: boolean
	/** Поле отключено */
	isDisabled?: boolean
	/** Текст ошибки под полем */
	error?: string
	/**
	 * Классы частей поля и панели (`root`, `trigger`, `panel`, `column`, `option`… — см. `CASCADER_PARTS`) — добавляются
	 * к классам кита. Глобально — `defaults.BaseCascader.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BaseCascader :items="regions" :ui="{ trigger: 'ring-1', column: 'w-56' }" />
	 */
	ui?: UiProp<BaseCascaderPart>
}

export interface BaseCascaderEmits {
	/** Новое значение: путь или список путей */
	(event: 'update:modelValue', value: CascaderValue): void
	/** Значение изменил пользователь */
	(event: 'change', value: CascaderValue): void
	/** Загрузка уровня через `load` не удалась: узел и ошибка промиса */
	(event: 'load-error', node: BaseCascaderNode, error: unknown): void
}

export interface BaseCascaderSlots {
	/** Выбранное значение в поле при одиночном выборе: путь id, подписи пути и узлы (ещё не загруженный — `undefined`) */
	selected?: (props: { path: CascaderPath; labels: string[]; nodes: (BaseCascaderNode | undefined)[] }) => unknown
	/** Строка узла в колонке или в результатах поиска: узел, выбран ли он, есть ли у него следующий уровень */
	option?: (props: { node: BaseCascaderNode; isSelected: boolean; hasChildren: boolean }) => unknown
	/** Пустой уровень или пустой результат поиска */
	empty?: () => unknown
}

export type CascaderProps = PropsWithDefaults<BaseCascaderProps, 'modelValue' | 'isRequired' | 'separator'>

/** Уровни и ленивая загрузка: индекс дерева с загруженными уровнями, состояние загрузки и ошибок */
export interface CascaderLevels {
	/** Индекс дерева (treeUtils): узлы — копии с загруженными детьми */
	index: ComputedRef<TreeIndex>
	roots: ComputedRef<BaseCascaderNode[]>
	childrenOf: (node: BaseCascaderNode) => BaseCascaderNode[]
	/** У узла есть следующий уровень: дети или ещё не загруженный уровень */
	hasChildren: (node: BaseCascaderNode) => boolean
	/** Загрузить уровень узла, если нужно; `true` — дети есть (загружены сейчас или раньше) */
	ensureChildren: (node: BaseCascaderNode) => Promise<boolean>
	isLoadingNode: (id: string) => boolean
	hasErrorNode: (id: string) => boolean
}

/** Навигация по колонкам: раскрытая цепочка и активный узел */
export interface CascaderNavigation {
	/** id раскрытых узлов от корня: колонки — корни и дети каждого */
	expandedPath: Ref<string[]>
	/** Уровень активного узла */
	activeLevel: Ref<number>
	/** id активного узла; `null` — нет */
	activeId: Ref<string | null>
	columns: ComputedRef<CascaderColumn[]>
}

/** Контекст панели BaseCascader для provide/inject */
export interface CascaderPanelContext {
	baseId: string
	columns: ComputedRef<CascaderColumn[]>
	expandedPath: Ref<string[]>
	activeLevel: Ref<number>
	activeId: Ref<string | null>
	searchQuery: Ref<string>
	isSearching: ComputedRef<boolean>
	results: ComputedRef<CascaderSearchResult[]>
	activeResult: Ref<number>
	separator: () => string
	isMultiple: () => boolean
	isSearchable: () => boolean
	sizeScale: () => number | undefined
	sizeScaleStyle: ComputedRef<Record<string, string> | undefined>
	classes: ComputedRef<Record<string, string | undefined>>
	/** Классы частей из пропа `ui` и `defaults.BaseCascader.ui` */
	ui: UiClassFn<BaseCascaderPart>
	/** Идёт раскрытие пути значения при открытии: колонки появляются без анимации */
	isRevealing: Ref<boolean>
	rootLabelledBy: ComputedRef<string | undefined>
	rootLabel: ComputedRef<string>
	hasChildren: (node: BaseCascaderNode) => boolean
	isSelectable: (node: BaseCascaderNode) => boolean
	isNodeSelected: (level: number, node: BaseCascaderNode) => boolean
	isPathSelected: (path: CascaderPath) => boolean
	optionId: (level: number, index: number) => string
	resultId: (index: number) => string
	columnId: (level: number) => string
	resultsId: string
	/** id панели: `aria-controls` поля, пока у активного уровня нет списка (загрузка) */
	panelId: string
	clickNode: (level: number, node: BaseCascaderNode) => void
	hoverNode: (level: number, node: BaseCascaderNode) => void
	clickResult: (result: CascaderSearchResult) => void
	hoverResult: (index: number) => void
	retry: (column: CascaderColumn) => void
	handleSearchKeydown: (event: KeyboardEvent) => void
	/** Активный вариант для `aria-activedescendant` поля и поиска */
	activeDescendant: ComputedRef<string | undefined>
	/** Список, которым управляет поле (`aria-controls`) */
	controls: ComputedRef<string | undefined>
}

export const CASCADER_PANEL_KEY: InjectionKey<CascaderPanelContext> = Symbol('cascader-panel')

/** Действия клавиатуры поля и поиска BaseCascader */
export interface CascaderKeyActions {
	isOpen: Ref<boolean>
	isDisabled: () => boolean
	isSearching: () => boolean
	open: () => void
	close: () => void
	activate: () => void
	move: (step: 1 | -1) => void
	moveToEdge: (edge: 'first' | 'last') => void
	forward: () => void
	back: () => void
	moveResult: (step: 1 | -1) => void
	chooseResult: () => void
}

/** Обработчик клавиши поля или поиска */
export type CascaderKeyHandler = (actions: CascaderKeyActions) => void
