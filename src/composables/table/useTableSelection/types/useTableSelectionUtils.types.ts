export interface MergeSelectedIdsOptions {
	/** Выбор до смены rows */
	selectedIds: Set<string | number>
	/** Флаги `isSelected` прежних строк по ID */
	previousFlags: Map<string | number, boolean | undefined>
	/** Флаги `isSelected` новых строк по ID */
	nextFlags: Map<string | number, boolean | undefined>
}
