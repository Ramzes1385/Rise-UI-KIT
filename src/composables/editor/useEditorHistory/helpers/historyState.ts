/** Утилиты: стеки шагов отмены редактора — запись, склейка и восстановление */
import { applyHtmlPatch, createHtmlPatch } from './htmlPatch'
import { readSelectionPath, writeSelectionPath } from './selectionPath'
import type {
	EditorHistoryChange,
	EditorHistoryDirection,
	EditorHistoryEdit,
	EditorHistoryEntry,
	EditorHistoryState,
	EditorSelectionPath,
} from '../types/useEditorHistory.types'

/** Сколько шагов хранится */
const MAX_DEPTH = 100
/** Пауза (мс), после которой набор начинает новый шаг */
const GROUP_PAUSE = 500
/** Сколько правок набора укладывается в один шаг */
const GROUP_SIZE = 20

function createHistoryState(): EditorHistoryState {
	return { undo: [], redo: [], present: null, open: null, captured: null, lastDom: '' }
}

/** Очищает стеки; исходным становится текущее содержимое области (без области — ничего) */
function resetHistoryState(state: EditorHistoryState, root: HTMLElement | null): void {
	state.undo = []
	state.redo = []
	state.open = null
	state.captured = null
	const html = root ? root.innerHTML : ''
	state.present = root ? { html, selection: readSelectionPath(root) } : null
	state.lastDom = html
}

function isSameSelection(first: EditorSelectionPath | null, second: EditorSelectionPath | null): boolean {
	return JSON.stringify(first) === JSON.stringify(second)
}

/**
 * Правку можно влить в открытый шаг: тот же вид, не пауза, каретка не прыгала; перетаскивание — только по времени.
 * Откат системных часов (`now` раньше открытого шага) паузой не считается, но и склейки не даёт: новый шаг.
 */
function canMerge(open: EditorHistoryEntry, change: EditorHistoryChange, before: EditorSelectionPath | null): boolean {
	if (change.kind === 'command' || open.kind !== change.kind || change.now < open.time || change.now - open.time >= GROUP_PAUSE)
		return false
	return change.kind === 'drag' || (open.count < GROUP_SIZE && isSameSelection(before, open.selectionAfter))
}

/** Добавляет новый шаг; старейший вытесняется за пределом глубины, команда закрывает группу склейки */
function pushEntry(state: EditorHistoryState, entry: EditorHistoryEntry): void {
	state.undo.push(entry)
	if (state.undo.length > MAX_DEPTH) state.undo.shift()
	state.open = entry.kind === 'command' ? null : entry
}

/** Вливает правку в открытый шаг или добавляет новый; `base` — HTML до правки */
function mergeOrPush(state: EditorHistoryState, change: EditorHistoryChange, edit: EditorHistoryEdit): void {
	const { open } = state
	const after = edit.after
	if (open && canMerge(open, change, edit.before)) {
		const base = applyHtmlPatch(edit.base, open.patch, 'undo')
		Object.assign(open, { patch: createHtmlPatch(base, edit.html), selectionAfter: after, time: change.now, count: open.count + 1 })
		return
	}
	const patch = createHtmlPatch(edit.base, edit.html)
	pushEntry(state, { kind: change.kind, patch, selectionBefore: edit.before, selectionAfter: after, time: change.now, count: 1 })
}

/** Записывает правку, уже сделанную в DOM; true — шаг добавлен или расширен */
function recordHistoryChange(state: EditorHistoryState, root: HTMLElement, change: EditorHistoryChange): boolean {
	const { present } = state
	const html = root.innerHTML
	const before = state.captured ?? present?.selection ?? null
	state.captured = null
	state.lastDom = html
	if (!present || html === present.html) {
		if (!present) state.present = { html, selection: readSelectionPath(root) }
		return false
	}
	const after = readSelectionPath(root)
	mergeOrPush(state, change, { base: present.html, html, before, after })
	state.redo = []
	state.present = { html, selection: after }
	return true
}

/** Выделение после восстановления: записанное, а если путь не найден — в конец области */
function restoreSelection(root: HTMLElement, selection: EditorSelectionPath | null): void {
	if (selection && writeSelectionPath(root, selection)) return
	window.getSelection()?.selectAllChildren(root)
	window.getSelection()?.collapseToEnd()
}

/** Переносит шаг между стеками и пишет восстановленный HTML в область; false, если нечего восстанавливать */
function restoreHistoryStep(state: EditorHistoryState, root: HTMLElement, direction: EditorHistoryDirection): boolean {
	const [from, to] = direction === 'undo' ? [state.undo, state.redo] : [state.redo, state.undo]
	const entry = from.pop()
	if (!entry || !state.present) return false
	to.push(entry)
	const html = applyHtmlPatch(state.present.html, entry.patch, direction)
	const selection = direction === 'undo' ? entry.selectionBefore : entry.selectionAfter
	root.innerHTML = html
	state.lastDom = root.innerHTML
	restoreSelection(root, selection)
	state.present = { html, selection }
	state.open = null
	return true
}

export { createHistoryState, recordHistoryChange, resetHistoryState, restoreHistoryStep }
