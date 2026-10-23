import type { UseTableFilterReturn } from '@composables/table/useTableFilter'
import type { UseTableSearchReturn } from '@composables/table/useTableSearch'

export interface TableDataActionsState {
	/** Добавить фильтр без сброса страницы */
	baseAddFilter: UseTableFilterReturn['addFilter']
	/** Удалить фильтр без сброса страницы */
	baseRemoveFilter: UseTableFilterReturn['removeFilter']
	/** Обработчик ввода поиска с необязательным сбросом страницы */
	handleSearchInput: UseTableSearchReturn['handleSearchInput']
	/** Сбросить страницу */
	resetPage: () => void
}
