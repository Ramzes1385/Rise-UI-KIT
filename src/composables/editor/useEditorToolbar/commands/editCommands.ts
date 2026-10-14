/** Утилиты: правка содержимого редактора на месте выделения — общая точка применения изменений DOM */
import { nextTick } from 'vue'
import type { EditorHistoryKind } from '../../useEditorHistory'
import { releasePlaceholders } from '@utils/dom/editorFormatUtils'
import { insertParagraphAtSelection } from '@utils/dom/editorBlockUtils'
import type { EditorEditContext, UseToolbarCommandsOptions } from '../types/useToolbarCommands.types'
import {
	collapseToEnd,
	deleteSelection,
	getSelectionRange,
	insertHtmlAtSelection,
	insertLineBreakAtSelection,
} from '@utils/dom/editorInsertUtils'

/** Завершение команды визуального режима: сохранить выделение, обновить активные форматы, сообщить о вводе */
function commitVisualChange(ctx: EditorEditContext, kind?: EditorHistoryKind): void {
	ctx.saveSelection()
	nextTick(ctx.updateActiveStates)
	ctx.onInput(kind)
}

/**
 * Единственная точка, через которую правки DOM редактора применяются к содержимому: выделение берётся
 * (при необходимости восстанавливается, а без неё каретка встаёт в конец текста), `change` меняет DOM, затем изменение фиксируется.
 * Возвращает true, если `change` что-то сделал.
 */
function applyEdit(ctx: EditorEditContext, change: (root: HTMLElement) => boolean, kind?: EditorHistoryKind): boolean {
	const root = ctx.editorRef.value
	if (!root) return false
	ctx.ensureSelection()
	if (!getSelectionRange(root)) {
		root.focus()
		collapseToEnd(root)
	}
	ctx.onBeforeChange?.()
	const isReleased = releasePlaceholders(root, window.getSelection()?.anchorNode ?? null)
	const isChanged = change(root)
	if (!isChanged && !isReleased) return false
	commitVisualChange(ctx, kind)
	return isChanged
}

/** Вставляет очищенный HTML на место выделения (визуальный режим) */
function insertHtmlCommand(ctx: UseToolbarCommandsOptions, html: string, kind?: EditorHistoryKind): boolean {
	return applyEdit(ctx, root => insertHtmlAtSelection(root, html), kind)
}

/** Вставляет перенос строки на место выделения (Shift+Enter); для истории это набор */
function insertLineBreakCommand(ctx: UseToolbarCommandsOptions): boolean {
	return applyEdit(ctx, insertLineBreakAtSelection, 'typing')
}

/** Enter: новый абзац или пункт списка на месте выделения; для истории это набор */
function insertParagraphCommand(ctx: UseToolbarCommandsOptions): boolean {
	return applyEdit(ctx, insertParagraphAtSelection, 'typing')
}

/** Вырезание: удаляет выделение одним шагом истории (в буфер текст кладёт обработчик `cut`) */
function deleteSelectionCommand(ctx: UseToolbarCommandsOptions): boolean {
	return applyEdit(
		ctx,
		root => {
			const range = getSelectionRange(root)
			if (!range || range.collapsed) return false
			deleteSelection(root, range)
			return true
		},
		'command',
	)
}

export { applyEdit, deleteSelectionCommand, commitVisualChange, insertHtmlCommand, insertLineBreakCommand, insertParagraphCommand }
