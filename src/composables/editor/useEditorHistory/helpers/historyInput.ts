/** Утилиты: что означают клавиши и виды ввода для истории отмены редактора */
import { getShortcutLetter } from '@utils/dom/keyboardUtils'
import type { EditorHistoryKind } from '../types/useEditorHistory.types'

/** keyCode, который браузер ставит клавишам во время набора через IME */
const IME_KEY_CODE = 229
const TYPING_INPUT_TYPES = new Set(['insertText', 'insertCompositionText', 'insertParagraph', 'insertLineBreak'])
const DRAG_INPUT_TYPES = new Set(['deleteByDrag', 'insertFromDrop'])

/** Нажатие без Ctrl и ⌘, с Alt или во время набора через IME истории не принадлежит */
function isIgnoredKey(event: KeyboardEvent): boolean {
	return event.isComposing || event.keyCode === IME_KEY_CODE || event.altKey || !(event.ctrlKey || event.metaKey)
}

/**
 * Действие истории для нажатия: отмена — Ctrl/⌘+Z, повтор — Ctrl/⌘+Shift+Z и Ctrl+Y (кроме macOS).
 * Нажатия во время IME и с Alt (AltGr в Windows — это Ctrl+Alt) не наши.
 */
function getHistoryAction(event: KeyboardEvent, isMac: boolean): 'redo' | 'undo' | null {
	if (isIgnoredKey(event)) return null
	const letter = getShortcutLetter(event)
	if (letter === 'z') return event.shiftKey ? 'redo' : 'undo'
	return letter === 'y' && event.ctrlKey && !event.shiftKey && !isMac ? 'redo' : null
}

/** Вид правки по `inputType` события ввода; без события и для неизвестных типов — команда */
function getHistoryKind(inputType?: string): EditorHistoryKind {
	if (!inputType) return 'command'
	if (TYPING_INPUT_TYPES.has(inputType)) return 'typing'
	if (DRAG_INPUT_TYPES.has(inputType)) return 'drag'
	return inputType.startsWith('delete') && inputType !== 'deleteByCut' ? 'deleting' : 'command'
}

export { getHistoryAction, getHistoryKind }
