import type { ColumnFilter, TableColumn } from '../model/BaseTable.types'

/** Props компонента BaseTableToolbar */
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
	/** Масштаб размера (базовая единица sizeScale) */
	sizeScale: number
	/** Максимальная высота панели настроек колонок */
	settingsMaxHeight: string
	/** CSS-класс для тулбара */
	toolbarClass?: string
	/** CSS-класс для блока поиска */
	searchClass?: string
	/** CSS-класс для блока фильтров */
	filtersClass?: string
	/** CSS-класс для панели настроек */
	settingsClass?: string
	/** CSS-класс для блока активных фильтров */
	activeFiltersClass?: string
	/** Функция получения текстовой метки для фильтра */
	getFilterLabel: (filter: ColumnFilter) => string
}
