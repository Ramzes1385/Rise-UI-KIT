import { computed } from 'vue'
import type { EditorApiContext } from '../../types/model/EditorApi.types'
import type { BaseEditorExpose, BaseEditorToolbarSlotProps } from '../../types/BaseEditor.types'

function activeField(ctx: EditorApiContext): () => HTMLElement | null {
	return () => (ctx.toolbar.isCodeMode.value ? ctx.toolbar.getCodeTextarea() : ctx.editorRef.value)
}

function insertVisualHtml(ctx: EditorApiContext, html: string): void {
	ctx.toolbar.saveSelection()
	ctx.editorRef.value?.focus()
	ctx.toolbar.restoreSelection()
	ctx.toolbar.insertHtml(html)
}

function whenUnlocked<Args extends unknown[]>(ctx: EditorApiContext, action: (...args: Args) => void): (...args: Args) => void {
	return (...args) => {
		if (!ctx.isLocked.value) action(...args)
	}
}

function stepHistory(ctx: EditorApiContext, direction: 'redo' | 'undo'): void {
	ctx.editorRef.value?.focus()
	ctx.toolbar.history[direction]()
}

export function createEditorApi(ctx: EditorApiContext) {
	const field = activeField(ctx)
	const insertHtml = (html: string): void => {
		const clean = ctx.sanitize(html)
		if (ctx.isLocked.value || !clean) return
		if (ctx.toolbar.isCodeMode.value) ctx.toolbar.insertCodeAtCursor(clean)
		else insertVisualHtml(ctx, clean)
	}
	const exposed: Omit<BaseEditorExpose, 'canRedo' | 'canUndo' | 'isEmpty' | 'rootRef'> = {
		focus: () => field()?.focus(),
		blur: () => field()?.blur(),
		getHtml: () => ctx.sanitize(ctx.toolbar.isCodeMode.value ? ctx.toolbar.codeContent.value : (ctx.editorRef.value?.innerHTML ?? '')),
		insertHtml,
		validate: ctx.formField.validate,
		reset: ctx.formField.reset,
		undo: () => stepHistory(ctx, 'undo'),
		redo: () => stepHistory(ctx, 'redo'),
	}
	const slotProps = computed((): BaseEditorToolbarSlotProps => ({
		activeStates: ctx.toolbar.activeStates,
		isCodeMode: ctx.toolbar.isCodeMode.value,
		isLocked: ctx.isLocked.value,
		applyFormat: whenUnlocked(ctx, ctx.toolbar.applyFormat),
		applyBlock: whenUnlocked(ctx, ctx.toolbar.applyBlock),
		insertHtml,
		openLinkDialog: ctx.openLinkDialog,
		toggleCodeMode: whenUnlocked(ctx, ctx.toolbar.toggleCodeMode),
		focus: exposed.focus,
		undo: exposed.undo,
		redo: exposed.redo,
		canUndo: ctx.toolbar.history.canUndo.value,
		canRedo: ctx.toolbar.history.canRedo.value,
	}))
	const { canUndo, canRedo } = ctx.toolbar.history
	return { exposed: { ...exposed, rootRef: ctx.editorRef, isEmpty: ctx.isEmpty, canUndo, canRedo }, slotProps }
}
