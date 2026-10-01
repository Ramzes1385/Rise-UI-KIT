export interface UseResizeDragOptions {
	onMove: (event: MouseEvent) => void
	onEnd: () => void
}

/** Стили body до начала перетаскивания */
export interface SavedBodyStyles {
	cursor: string
	userSelect: string
}
