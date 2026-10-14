import type { ComputedRef, Ref } from 'vue'
import type { TableRow } from '@components/BaseTable/types/BaseTable.types'

export interface UseTableSelectionOptions {
	/** Строки данных */
	rows: Ref<TableRow[]>
	/**
	 * Строки, прошедшие поиск и фильтры (все страницы) — область действия «Выбрать все».
	 * По умолчанию совпадает с rows.
	 */
	filteredRows?: Ref<TableRow[]>
	/**
	 * Сохранять ли выбор строк вне `filteredRows` при «Выбрать все» и снятии выбора (область «страница»).
	 * По умолчанию `false`: строки вне области теряют выбор
	 */
	isKeepingOutOfScope?: () => boolean
	/** Callback при изменении выбора */
	onSelect?: (rows: TableRow[]) => void
	/**
	 * Выбранные id снаружи (`v-model:selectedIds`). При заданном значении выбор управляется родителем: `isSelected` строк
	 * не учитывается, id строк, которых нет в `rows` (другие страницы), сохраняются, а действия выбора только сообщают
	 * новый набор в `onSelectedIdsChange`. `undefined` — выбор внутренний
	 */
	selectedIds?: () => ReadonlyArray<string | number> | undefined
	/** Callback с новым набором выбранных id при любом изменении выбора, в том числе `clearSelection` */
	onSelectedIdsChange?: (ids: Array<string | number>) => void
}

export interface UseTableSelectionReturn {
	/** ID выбранных строк */
	selectedIds: ComputedRef<Set<string | number>>
	/** Выбранные строки */
	selectedRows: ComputedRef<TableRow[]>
	/** Все ли доступные строки отфильтрованного набора выбраны */
	isAllSelected: ComputedRef<boolean>
	/** Выбрана часть доступных строк отфильтрованного набора (частичное состояние «Выбрать все») */
	isSomeSelected: ComputedRef<boolean>
	/** Доступных строк в отфильтрованном наборе нет: «Выбрать все» неактивен */
	isSelectAllDisabled: ComputedRef<boolean>
	/** Проверить, выбрана ли строка */
	isSelected: (row: TableRow) => boolean
	/** Переключить выбор строки */
	toggleRow: (row: TableRow) => void
	/** Выбрать/снять выбор со всех строк отфильтрованного набора */
	toggleAll: () => void
	/** Снять выбор со всех строк, включая отключённые и не попавшие в `rows` */
	clearSelection: () => void
}

export interface SelectionSyncState {
	/** Строки данных */
	rows: Ref<TableRow[]>
	/** Внутренний набор выбранных id */
	selectedIds: Ref<Set<string | number>>
	/** Выбор управляется снаружи: смена rows его не пересобирает */
	isControlled: () => boolean
	/** Выбор потерял строки, которых больше нет в rows */
	onSelectionLost: () => void
}
