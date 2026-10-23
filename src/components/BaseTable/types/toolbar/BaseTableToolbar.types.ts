import type { FilterKind } from '@composables/table/useTableFilter'
import type { DropdownMenuItems } from '@components/BaseDropdownMenu'
import type { ColumnFilter, FilterOption, TableColumn } from '../BaseTable.types'

export interface BaseTableToolbarProps {
	/** Показывать тулбар */
	showToolbar: boolean
	/** Показывать поле поиска */
	hasSearch: boolean
	/** Показывать секцию фильтров */
	hasFilters: boolean
	/** Показывать настройки видимости колонок */
	hasColumnSettings: boolean
	/** Текущее значение поискового запроса */
	searchQuery: string
	/** Выбранная колонка для фильтрации */
	filterColumn: string | number
	/** Выбранный оператор фильтрации */
	filterOperator: string | number
	/** Значение фильтра */
	filterValue: string
	/** Верхняя граница оператора `between` */
	filterValueTo: string
	/** Выбранные значения оператора `in` */
	filterValues: string[]
	/** Тип поля значения: текст, число, дата, одно значение или несколько из списка */
	filterKind: FilterKind
	/** Варианты значения для колонок `select` и `multi-select` */
	filterSelectOptions: FilterOption[]
	/** Подсказка поля значения */
	filterPlaceholder?: string
	/** Выбран оператор `between`: показать второе поле значения */
	isRangeOperator: boolean
	/** Введено достаточно для добавления фильтра: иначе кнопка «Добавить» недоступна */
	canAddFilter: boolean
	/** Опции выбора колонки для фильтра */
	filterColumnOptions: Array<{ value: string | number; label: string }>
	/** Опции выбора оператора фильтрации */
	filterOperatorOptions: Array<{ value: string; label: string }>
	/** Список активных фильтров */
	activeFilters: ColumnFilter[]
	/** Определения колонок таблицы */
	columns: TableColumn[]
	/** Открыта ли панель настроек колонок */
	isSettingsOpen: boolean
	/** Пункты меню «Экспорт»: пусто — кнопки нет */
	exportItems: DropdownMenuItems
	/** Открыто ли меню «Экспорт» */
	isExportOpen: boolean
	/** Масштаб размера (базовая единица sizeScale) */
	sizeScale: number
	/** CSS-класс для тулбара */
	toolbarClass?: string
	/** CSS-класс для блока поиска */
	searchClass?: string
	/** CSS-класс для блока фильтров */
	filtersClass?: string
	/** CSS-класс для панели настроек */
	settingsClass?: string
	/** CSS-класс для блока экспорта */
	exportClass?: string
	/** CSS-класс для блока активных фильтров */
	activeFiltersClass?: string
	/** Функция получения текстовой метки для фильтра */
	getFilterLabel: (filter: ColumnFilter) => string
}

export interface BaseTableToolbarEmits {
	(event: 'search-input', value: string): void
	(event: 'update:filter-column', value: string | number | (string | number)[]): void
	(event: 'update:filter-operator', value: string | number | (string | number)[]): void
	(event: 'update:filter-value', value: string): void
	(event: 'update:filter-value-to', value: string): void
	(event: 'update:filter-values', value: string[]): void
	(event: 'add-filter'): void
	(event: 'remove-filter', index: number): void
	(event: 'update:is-settings-open', value: boolean): void
	(event: 'toggle-column-visibility', column: TableColumn): void
	(event: 'update:is-export-open', value: boolean): void
}

export interface BaseTableToolbarSlots {
	/** Контент перед элементами тулбара */
	'toolbar-prepend'?: () => unknown
	/** Контент после элементов тулбара */
	'toolbar-append'?: () => unknown
}
