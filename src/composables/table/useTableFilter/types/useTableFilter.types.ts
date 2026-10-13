import type { Ref } from 'vue'
import type { ColumnFilter, TableColumn } from '@components/BaseTable/types/BaseTable.types'

/** Тип поля фильтра: определяет набор операторов и вид поля значения в тулбаре */
export type FilterKind = 'text' | 'number' | 'date' | 'select' | 'multi-select'

export interface UseTableFilterOptions {
	/** Колонки */
	columns: Ref<TableColumn[]>
	/** Callback при изменении фильтров */
	onFilter?: (filters: ColumnFilter[]) => void
}

/** Поля нового фильтра: колонка, оператор и значения. Рядом с `value` — верхняя граница `between` и список значений `in` */
export interface FilterDraft {
	/** Ключ колонки */
	column: Ref<string | number>
	/** Оператор */
	operator: Ref<string | number>
	/** Значение; после добавления очищается */
	value: Ref<string>
	/** Верхняя граница диапазона для `between` */
	valueTo?: Ref<string>
	/** Выбранные значения для `in` */
	values?: Ref<string[]>
}

export interface UseTableFilterReturn {
	/** Активные фильтры */
	activeFilters: Ref<ColumnFilter[]>
	/** Добавить фильтр: пустой или неполный (`between` без границы, `in` без значений) не добавляется */
	addFilter: (draft: FilterDraft) => void
	/** Удалить фильтр */
	removeFilter: (index: number) => void
	/** Получить текстовую метку фильтра */
	getFilterLabel: (filter: ColumnFilter) => string
}
