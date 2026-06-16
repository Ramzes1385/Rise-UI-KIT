import { useToolbarCodeMode } from './useToolbarCodeMode'
import { useToolbarCommands } from './useToolbarCommands'
import { useToolbarMediaMenu } from './useToolbarMediaMenu'
import { useToolbarSelection } from './useToolbarSelection'
import type { UseEditorToolbarOptions } from './useEditorToolbar.types'

function useEditorToolbar(options: UseEditorToolbarOptions) {
	const { editorRef, codeTextareaRef, onInput } = options

	const selection = useToolbarSelection({ editorRef })
	const codeMode = useToolbarCodeMode({ editorRef, codeTextareaRef, onInput })
	const mediaMenu = useToolbarMediaMenu({ onInput })
	const commands = useToolbarCommands({
		editorRef,
		onInput,
		activeStates: selection.activeStates,
		updateActiveStates: selection.updateActiveStates,
		saveSelection: selection.saveSelection,
		restoreSelection: selection.restoreSelection,
		ensureSelection: selection.ensureSelection,
		isCodeMode: codeMode.isCodeMode,
		codeContent: codeMode.codeContent,
		wrapCodeSelection: codeMode.wrapCodeSelection,
		insertCodeAtCursor: codeMode.insertCodeAtCursor,
		getCodeTextarea: codeMode.getCodeTextarea,
	})

	return {
		...selection,
		...codeMode,
		...mediaMenu,
		...commands,
	}
}

export { useEditorToolbar }
