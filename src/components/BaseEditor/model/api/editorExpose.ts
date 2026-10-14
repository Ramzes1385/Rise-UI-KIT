import { computed } from 'vue'
import type { EditorApiContext } from '../../types/EditorApi.types'
import type { BaseEditorExpose, BaseEditorToolbarSlotProps } from '../../types/BaseEditor.types'

function activeField(ctx: EditorApiContext): () => HTMLElement | null {
	return () => (ctx.toolbar.isCodeMode.value ? ctx.toolbar.getCodeTextarea() : ctx.editorRef.value)
}

function insertVisualHtml(ctx: EditorApiContext, html: string): void {
	ctx.editorRef.value?.focus()
	ctx.toolbar.ensureSelection()
	document.execCommand('insertHTML', false, html)
	ctx.toolbar.saveSelection()
	ctx.handleInput()
}

function whenUnlocked<Args extends unknown[]>(ctx: EditorApiContext, action: (...args: Args) => void): (...args: Args) => void {
	return (...args) => {
		if (!ctx.isLocked.value) action(...args)
	}
}

export function createEditorApi(ctx: EditorApiContext) {
	const field = activeField(ctx)
	const insertHtml = (html: string): void => {
		const clean = ctx.sanitize(html)
		if (ctx.isLocked.value || !clean) return
		if (ctx.toolbar.isCodeMode.value) ctx.toolbar.insertCodeAtCursor(clean)
		else insertVisualHtml(ctx, clean)
	}
	const exposed: Omit<BaseEditorExpose, 'rootRef' | 'isEmpty'> = {
		focus: () => field()?.focus(),
		blur: () => field()?.blur(),
		getHtml: () => ctx.sanitize(ctx.toolbar.isCodeMode.value ? ctx.toolbar.codeContent.value : (ctx.editorRef.value?.innerHTML ?? '')),
		insertHtml,
		validate: ctx.formField.validate,
		reset: ctx.formField.reset,
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
	}))
	return { exposed: { ...exposed, rootRef: ctx.editorRef, isEmpty: ctx.isEmpty }, slotProps }
}
