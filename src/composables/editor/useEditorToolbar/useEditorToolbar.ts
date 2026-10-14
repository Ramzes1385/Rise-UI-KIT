/** Composable: тулбар редактора (выделение, код-режим, медиа-меню, команды форматирования) */
import { useEditorHistory } from '../useEditorHistory'
import { useToolbarCodeMode } from './useToolbarCodeMode'
import { useToolbarCommands } from './useToolbarCommands'
import { useToolbarMediaMenu } from './useToolbarMediaMenu'
import { useToolbarMediaUrls } from './useToolbarMediaUrls'
import { useToolbarSelection } from './useToolbarSelection'
import type { UseEditorToolbarOptions } from './types/useEditorToolbar.types'

function useEditorToolbar(options: UseEditorToolbarOptions) {
	const { editorRef, codeTextareaRef, onInput } = options

	const selection = useToolbarSelection({ editorRef })
	const codeMode = useToolbarCodeMode({ editorRef, codeTextareaRef, onInput, sanitize: options.sanitize })
	const mediaUrls = useToolbarMediaUrls({ editorRef, codeContent: codeMode.codeContent })
	const baseHistory = useEditorHistory({
		root: editorRef,
		isEnabled: () => !options.isReadonly?.() && !codeMode.isCodeMode.value,
		onRestore: () => options.onRestore?.(),
	})
	const history = {
		...baseHistory,
		reset(): void {
			baseHistory.reset()
			mediaUrls.prune()
		},
	}
	const mediaMenu = useToolbarMediaMenu({ editorRef, onInput, isReadonly: options.isReadonly })
	const saveSelection = (): void => {
		selection.saveSelection()
		mediaMenu.refreshMediaSelection()
	}
	const commands = useToolbarCommands({
		editorRef,
		onInput,
		onBeforeChange: history.capture,
		createMediaUrl: mediaUrls.create,
		activeStates: selection.activeStates,
		updateActiveStates: selection.updateActiveStates,
		saveSelection,
		restoreSelection: selection.restoreSelection,
		ensureSelection: selection.ensureSelection,
		isCodeMode: codeMode.isCodeMode,
		codeContent: codeMode.codeContent,
		wrapCodeSelection: codeMode.wrapCodeSelection,
		insertCodeAtCursor: codeMode.insertCodeAtCursor,
		getCodeTextarea: codeMode.getCodeTextarea,
		promptForUrl: options.promptForUrl,
	})

	return {
		history,
		...selection,
		saveSelection,
		...codeMode,
		...mediaMenu,
		...commands,
	}
}

export { useEditorToolbar }
