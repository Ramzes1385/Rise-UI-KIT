import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления BaseFilterBuilder: `default` — панель в рамке, `soft` — на подложке без рамки,
 * `outline` — рамка без фона, `ghost` — без рамки и отступов (внутри поповера или панели таблицы)
 */
export const FILTER_BUILDER_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

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
}

/**
 * События компонента BaseFilterBuilder
 */
export interface BaseFilterBuilderEmits {
	/** Новый фильтр после любого изменения */
	(event: 'update:modelValue', value: FilterBuilderGroup): void
}
