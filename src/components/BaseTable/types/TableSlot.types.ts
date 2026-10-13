/** Свойства `TableSlot`: слот приложения, который вызывается с `args`; без слота выводится содержимое по умолчанию */
export interface TableSlotProps {
	/** Слот приложения (`cell-<key>`, `header-<key>`) или `undefined`, если он не передан */
	render?: (args: object) => unknown
	/** Аргументы слота: `row`, `value`, `column` и т. д. */
	args: object
}
