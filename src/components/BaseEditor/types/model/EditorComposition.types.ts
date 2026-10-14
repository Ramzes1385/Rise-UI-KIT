export interface EditorComposition {
	readonly isActive: boolean
	handleCompositionStart: () => void
	handleCompositionEnd: () => void
}
