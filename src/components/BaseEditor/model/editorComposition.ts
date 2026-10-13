import type { EditorComposition } from '../types/EditorComposition.types'

export function useEditorComposition(onEnd: () => void): EditorComposition {
	const state = { isActive: false }
	return {
		get isActive() {
			return state.isActive
		},
		handleCompositionStart(): void {
			state.isActive = true
		},
		handleCompositionEnd(): void {
			state.isActive = false
			onEnd()
		},
	}
}
