export interface ChatSelectionToolbarProps {
	selectedCount: number
	sizeScale?: number
}

export interface ChatSelectionToolbarEmits {
	(e: 'forward'): void
	(e: 'delete'): void
	(e: 'cancel'): void
}
