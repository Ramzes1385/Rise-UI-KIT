import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления BaseFilterBuilder: `default` — панель в рамке, `soft` — на подложке без рамки,
 * `outline` — рамка без фона, `ghost` — без рамки и отступов (внутри поповера или панели таблицы)
 */
export const FILTER_BUILDER_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/**
 * Части конструктора фильтров для пропа `ui` (БЭМ-элементы `.base-filter-builder__<часть>`, `root` — сам конструктор):
 * match — строка связки «Показывать строки, где выполняются»; select — обёртка выпадающего списка со стрелкой;
 * empty — подсказка «Условий нет»; list — список условий `<ol>`; item — пункт списка с условием; row — строка условия
 * (группа «Условие N»); joiner — связка «Где», «и», «или»; input — поле ввода значения; value — поле значения (список или ввод);
 * remove — кнопка удаления условия (корень BaseButton); actions — строка кнопок под условиями; button — кнопки
 * «Добавить условие» и «Сбросить»; add — кнопка «Добавить условие».
 */
export const FILTER_BUILDER_PARTS = [
	'match',
	'select',
	'empty',
	'list',
	'item',
	'row',
	'joiner',
	'input',
	'value',
	'remove',
	'actions',
	'button',
	'add',
] as const

/** Часть конструктора фильтров для пропа `ui` */
export type BaseFilterBuilderPart = (typeof FILTER_BUILDER_PARTS)[number]

/** Типы полей: от типа зависят сравнения и поле значения */
export const FILTER_BUILDER_FIELD_TYPES = ['text', 'number', 'date', 'select', 'boolean'] as const

/** Тип поля фильтра */
export type FilterBuilderFieldType = (typeof FILTER_BUILDER_FIELD_TYPES)[number]

/** Сравнения условий */
export const FILTER_BUILDER_OPERATORS = [
	'contains',
	'notContains',
	'eq',
	'ne',
	'startsWith',
	'gt',
	'gte',
	'lt',
	'lte',
	'between',
	'before',
	'after',
	'empty',
	'notEmpty',
	'isTrue',
	'isFalse',
] as const

/** Сравнение в условии */
export type FilterBuilderOperator = (typeof FILTER_BUILDER_OPERATORS)[number]

/** Поле, по которому можно фильтровать: ключ в строке данных, подпись и тип; `options` — значения для `select` */
export interface FilterBuilderField {
	key: string
	label: string
	type: FilterBuilderFieldType
	options?: readonly { value: string; label: string }[]
}

/** Условие: поле, сравнение и значение; `valueTo` — верхняя граница для `between`. Даты — `ГГГГ-ММ-ДД` */
export interface FilterBuilderCondition {
	id: string
	field: string
	operator: FilterBuilderOperator
	value: string
	valueTo?: string
}

/** Фильтр: условия и связка — `all` (все выполняются) или `any` (хотя бы одно) */
export interface FilterBuilderGroup {
	match: 'all' | 'any'
	conditions: FilterBuilderCondition[]
}

/** Значение ячейки, приведённое для сравнения: текст без регистра, число и дата `ГГГГ-ММ-ДД` */
export interface FilterBuilderCell {
	raw: unknown
	text: string
	number: number
	date: string
}

/** Строка условия для разметки: поле, доступные сравнения и какое поле значения показать */
export interface FilterBuilderRow {
	condition: FilterBuilderCondition
	field: FilterBuilderField | undefined
	operators: { value: FilterBuilderOperator; label: string }[]
	valueKind: 'none' | 'single' | 'range'
	inputType: 'text' | 'number' | 'date' | 'select'
}

/**
 * Пропсы компонента BaseFilterBuilder
 */
export interface BaseFilterBuilderProps extends BaseComponentProps<(typeof FILTER_BUILDER_VARIANTS)[number], 'root' | 'row' | 'actions'> {
	/** Поля, по которым можно строить условия */
	fields: readonly FilterBuilderField[]
	/** Фильтр (`v-model`); строки данных отбирает `createFilterPredicate(фильтр, поля)` */
	modelValue?: FilterBuilderGroup
	/** Отключает изменение фильтра */
	isDisabled?: boolean
	/**
	 * Классы частей конструктора (`root`, `list`, `item`, `row`, `select`, `input`, `remove`, `add`…) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseFilterBuilder: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseFilterBuilder v-model="filter" :fields="fields" :ui="{ row: 'my-filter-row', add: 'my-filter-add' }" />
	 */
	ui?: UiProp<BaseFilterBuilderPart>
}

/**
 * События компонента BaseFilterBuilder
 */
export interface BaseFilterBuilderEmits {
	/** Новый фильтр после любого изменения */
	(event: 'update:modelValue', value: FilterBuilderGroup): void
}
