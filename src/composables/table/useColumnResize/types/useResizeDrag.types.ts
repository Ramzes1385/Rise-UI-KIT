export interface UseResizeDragOptions {
	/** Указатель сдвинулся: вызывается не чаще раза за кадр, с последним положением */
	onMove: (event: PointerEvent) => void
	/** Указатель отпущен или жест прерван (`pointerup`, `pointercancel`) */
	onEnd: () => void
}

/** Стили body до начала перетаскивания */
export interface SavedBodyStyles {
	cursor: string
	userSelect: string
}
