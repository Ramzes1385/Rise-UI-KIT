export interface UseResizeDragOptions {
	/** Указатель сдвинулся: вызывается не чаще раза за кадр, с последним положением */
	onMove: (event: PointerEvent) => void
	/** Жест закончился: `pointerup` (`isCancelled: false`) или `pointercancel` (`isCancelled: true`, не применённое движение отброшено) */
	onEnd: (isCancelled: boolean) => void
}

/** Стили body до начала перетаскивания */
export interface SavedBodyStyles {
	cursor: string
	userSelect: string
}
