import { onScopeDispose, ref } from 'vue'
import { UI_EDITOR } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import type { EditorUploadMedia } from '../../types/BaseEditor.types'
import { findPlaceholder, hasMediaSource, mediaFilesOf, mediaHtml, placeholderHtml } from './editorUpload'
import type {
	EditorMediaFile,
	EditorUploadAnswer,
	EditorMediaKind,
	EditorUploadContext,
	EditorUploadSlot,
} from '../../types/model/EditorUpload.types'

function openSlot(ctx: EditorUploadContext, id: number, kind: EditorMediaKind): EditorUploadSlot {
	if (ctx.toolbar.isCodeMode.value) return { id, snapshot: null }
	ctx.toolbar.insertHtml(placeholderHtml(id, kind), 'command')
	return { id, snapshot: ctx.editorRef.value?.innerHTML ?? null }
}

function isUntouched(ctx: EditorUploadContext, slot: EditorUploadSlot): boolean {
	return slot.snapshot !== null && slot.snapshot === ctx.editorRef.value?.innerHTML
}

function swapPlaceholder(ctx: EditorUploadContext, slot: EditorUploadSlot, html: string): void {
	const element = findPlaceholder(ctx.editorRef.value, slot.id)
	if (!element) return
	ctx.toolbar.history.capture()
	const template = document.createElement('template')
	template.innerHTML = html
	element.replaceWith(template.content)
	ctx.commit()
}

function replaceSlot(ctx: EditorUploadContext, slot: EditorUploadSlot, html: string): void {
	if (ctx.toolbar.isCodeMode.value) {
		if (html) ctx.toolbar.insertCodeAtCursor(html)
		return
	}
	if (isUntouched(ctx, slot) && ctx.toolbar.history.rollback()) {
		if (html) ctx.toolbar.insertHtml(html, 'command')
		return
	}
	swapPlaceholder(ctx, slot, html)
}

function resultHtml(ctx: EditorUploadContext, kind: EditorMediaKind, result: EditorUploadAnswer): string {
	if (ctx.isLocked()) return ''
	const html = ctx.sanitize(mediaHtml(kind, result))
	return hasMediaSource(html) ? html : ''
}

function takeInputFile(event: Event): File | null {
	const input = event.target
	if (!(input instanceof HTMLInputElement) || !input.files?.length) return null
	const file = input.files[0]
	input.value = ''
	return file
}

async function finishUpload(
	job: { ctx: EditorUploadContext; slot: EditorUploadSlot; media: EditorMediaFile },
	task: Promise<EditorUploadAnswer>,
) {
	const { ctx, slot, media } = job
	const html = resultHtml(ctx, media.kind, await task)
	if (!html && !ctx.isLocked()) throw new Error(UI_EDITOR.UPLOAD_ERROR)
	replaceSlot(ctx, slot, html)
}

function useUploadRegistry() {
	const controllers = new Map<number, AbortController>()
	const count = ref(0)
	let lastId = 0
	onScopeDispose(() => {
		controllers.forEach(controller => controller.abort())
		controllers.clear()
	})
	return {
		count,
		begin(): { id: number; controller: AbortController } {
			const entry = { id: ++lastId, controller: new AbortController() }
			controllers.set(entry.id, entry.controller)
			count.value = controllers.size
			return entry
		},
		end(id: number): void {
			controllers.delete(id)
			count.value = controllers.size
		},
	}
}

export function useEditorUpload(ctx: EditorUploadContext) {
	const registry = useUploadRegistry()
	const error = ref('')

	async function upload(send: EditorUploadMedia, media: EditorMediaFile, shouldRestoreSelection = false): Promise<void> {
		const { id, controller } = registry.begin()
		error.value = ''
		if (shouldRestoreSelection) ctx.toolbar.restoreSelection()
		const slot = openSlot(ctx, id, media.kind)
		try {
			await finishUpload({ ctx, slot, media }, send(media.file, { signal: controller.signal }))
		} catch (cause) {
			if (controller.signal.aborted) return
			replaceSlot(ctx, slot, '')
			error.value = formatMessage(UI_EDITOR.UPLOAD_ERROR, { name: media.file.name })
			ctx.onError(media.file, cause)
		} finally {
			registry.end(id)
		}
	}

	function launch(media: EditorMediaFile, shouldRestoreSelection = false): void {
		const send = ctx.getUpload()
		if (send) void upload(send, media, shouldRestoreSelection)
	}

	function handleInputFile(event: Event, kind: EditorMediaKind, fallback: (event: Event) => void): void {
		if (!ctx.getUpload()) return fallback(event)
		const file = takeInputFile(event)
		if (file) launch({ file, kind }, true)
	}

	return {
		error,
		count: registry.count,
		startAll: (files: EditorMediaFile[]): void => files.forEach(media => launch(media)),
		takeFiles: (transfer: DataTransfer | null | undefined): EditorMediaFile[] => (ctx.getUpload() ? mediaFilesOf(transfer) : []),
		handleImageUpload: (event: Event) => handleInputFile(event, 'image', ctx.toolbar.handleImageUpload),
		handleVideoUpload: (event: Event) => handleInputFile(event, 'video', ctx.toolbar.handleVideoUpload),
	}
}
