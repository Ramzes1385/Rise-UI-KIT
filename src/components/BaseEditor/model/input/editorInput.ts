import { getHistoryKind } from '@composables/editor/useEditorHistory'
import type { EditorInputDeps, EditorInputHandlers, EditorInputSource } from '../../types/EditorInput.types'

function kindOf(source?: EditorInputSource) {
	if (typeof source === 'string') return source
	return getHistoryKind(source instanceof InputEvent ? source.inputType : undefined)
}

export function createEditorInput(deps: EditorInputDeps): EditorInputHandlers {
	const { editorRef, composition, toolbar, state } = deps
	return {
		handleInput(source): void {
			if (composition.isActive) {
				state.checkEmpty()
				return
			}
			if (toolbar.isCodeMode.value) {
				deps.emitValue(deps.sanitize(toolbar.codeContent.value))
				return
			}
			if (!editorRef.value) return
			toolbar.history.record(kindOf(source))
			toolbar.convertInlineHtml()
			deps.emitValue(deps.sanitize(editorRef.value.innerHTML))
			toolbar.updateActiveStates()
			state.checkEmpty()
		},
		restore(): void {
			if (editorRef.value) deps.emitValue(deps.sanitize(editorRef.value.innerHTML))
			toolbar.saveSelection()
			toolbar.closeContextMenu()
			state.checkEmpty()
		},
	}
}
