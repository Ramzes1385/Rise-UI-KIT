/** Composable: история отмены редактора — свои шаги вместо стека браузера */
import { computed, shallowRef } from 'vue'
import { getHistoryAction } from './helpers/historyInput'
import { readSelectionPath } from './helpers/selectionPath'
import { isMacPlatform } from '@composables/interaction/useHotkeys'
import { createHistoryState, recordHistoryChange, resetHistoryState, restoreHistoryStep } from './helpers/historyState'
import type { EditorHistory, EditorHistoryDirection, EditorHistoryKind, UseEditorHistoryOptions } from './types/useEditorHistory.types'

/** Обработчики событий: клавиши и `beforeinput` запускают отмену, прочий ввод запоминает выделение */
function createHistoryHandlers(
	options: UseEditorHistoryOptions,
	step: (direction: EditorHistoryDirection) => boolean,
	capture: () => void,
) {
	return {
		handleKeyDown(event: KeyboardEvent): boolean {
			const action = options.isEnabled() ? getHistoryAction(event, isMacPlatform()) : null
			if (!action) return false
			event.preventDefault()
			step(action)
			return true
		},
		handleBeforeInput(event: InputEvent, isComposing: boolean): boolean {
			if (!options.isEnabled()) return false
			if (event.inputType === 'historyUndo' || event.inputType === 'historyRedo') {
				event.preventDefault()
				if (!isComposing) step(event.inputType === 'historyUndo' ? 'undo' : 'redo')
				return true
			}
			if (!isComposing && event.inputType !== 'insertFromDrop') capture()
			return false
		},
	}
}

/**
 * История отмены области ввода: каждая правка DOM записывается шагом (патч HTML и выделение до и после),
 * Ctrl/⌘+Z, Ctrl/⌘+Shift+Z и Ctrl+Y (кроме macOS) выполняются своим кодом одинаково во всех браузерах.
 * Набор склеивается в шаг по паузе 500 мс или 20 правкам, команды — всегда отдельные шаги, глубина 100.
 *
 * @example
 * ```ts
 * const history = useEditorHistory({ root: editorRef, isEnabled: () => !isLocked.value, onRestore: emitValue })
 * history.capture() // перед правкой DOM
 * history.record('command') // после правки
 * ```
 */
function useEditorHistory(options: UseEditorHistoryOptions): EditorHistory {
	const state = createHistoryState()
	const version = shallowRef(0)
	const touch = (): void => {
		version.value++
	}

	function capture(): void {
		const root = options.root.value
		if (root) state.captured = readSelectionPath(root)
	}

	function record(kind: EditorHistoryKind): void {
		const root = options.root.value
		if (!root || !options.isEnabled()) return
		recordHistoryChange(state, root, { kind, now: Date.now() })
		touch()
	}

	function step(direction: EditorHistoryDirection): boolean {
		const root = options.root.value
		if (!root || !options.isEnabled() || state[direction].length === 0) return false
		if (root.innerHTML !== state.lastDom) record('command')
		const isRestored = restoreHistoryStep(state, root, direction)
		touch()
		if (!isRestored) return false
		options.onRestore()
		return true
	}

	const hasSteps = (stack: EditorHistoryDirection): boolean => {
		void version.value
		return options.isEnabled() && state[stack].length > 0
	}

	return {
		canUndo: computed(() => hasSteps('undo')),
		canRedo: computed(() => hasSteps('redo')),
		capture,
		record,
		undo: () => step('undo'),
		redo: () => step('redo'),
		reset(): void {
			resetHistoryState(state, options.root.value)
			touch()
		},
		...createHistoryHandlers(options, step, capture),
	}
}

export { useEditorHistory }
