/** Утилиты: патч между двумя строками HTML для шагов отмены редактора */
import type { EditorHtmlPatch } from '../types/useEditorHistory.types'

/** Длина общего начала двух строк */
function commonPrefix(before: string, after: string): number {
	const max = Math.min(before.length, after.length)
	let length = 0
	while (length < max && before.charCodeAt(length) === after.charCodeAt(length)) length++
	return length
}

/** Длина общего конца двух строк, не заходящего в уже найденное общее начало */
function commonSuffix(before: string, after: string, prefix: number): number {
	const max = Math.min(before.length, after.length) - prefix
	let length = 0
	while (length < max && before.charCodeAt(before.length - 1 - length) === after.charCodeAt(after.length - 1 - length)) length++
	return length
}

/** Патч, превращающий `before` в `after`: хранится только изменённая середина, а не весь документ */
function createHtmlPatch(before: string, after: string): EditorHtmlPatch {
	const start = commonPrefix(before, after)
	const end = commonSuffix(before, after, start)
	return { start, removed: before.slice(start, before.length - end), inserted: after.slice(start, after.length - end) }
}

/** Применяет патч к строке: `redo` — от старой строки к новой, `undo` — от новой к старой */
function applyHtmlPatch(html: string, patch: EditorHtmlPatch, direction: 'redo' | 'undo'): string {
	const { start, removed, inserted } = patch
	return direction === 'undo'
		? html.slice(0, start) + removed + html.slice(start + inserted.length)
		: html.slice(0, start) + inserted + html.slice(start + removed.length)
}

export { applyHtmlPatch, createHtmlPatch }
