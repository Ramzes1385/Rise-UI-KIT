export interface ChatSelectionToolbarProps {
	selectedCount: number
	/** Сколько сообщений можно выбрать (видимых в ленте): когда выбраны все, «Выбрать всё» недоступно */
	totalCount?: number
	sizeScale?: number
}

export interface ChatSelectionToolbarEmits {
	(e: 'select-all'): void
	(e: 'forward'): void
	(e: 'delete'): void
	(e: 'cancel'): void
}
