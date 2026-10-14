import { UI_EDITOR } from '@/locales/messages'
import { escapeHtml } from '@utils/dom/htmlUtils'
import type { EditorMediaFile, EditorMediaKind, EditorUploadAnswer } from '../../types/model/EditorUpload.types'

const UPLOAD_ATTR = 'data-editor-upload'
const VIDEO_STYLE = 'max-width:100%;border-radius:8px;'

function mediaKind(file: File): EditorMediaKind | null {
	if (file.type.startsWith('image/')) return 'image'
	return file.type.startsWith('video/') ? 'video' : null
}

export function mediaFilesOf(transfer: DataTransfer | null | undefined): EditorMediaFile[] {
	const files = Array.from(transfer?.files ?? [])
	return files.flatMap(file => {
		const kind = mediaKind(file)
		return kind ? [{ file, kind }] : []
	})
}

export function placeholderHtml(id: number, kind: EditorMediaKind): string {
	const label = escapeHtml(UI_EDITOR.UPLOADING)
	return `<span class="base-editor__upload base-editor__upload--${kind}" ${UPLOAD_ATTR}="${id}" contenteditable="false" role="img" aria-busy="true" aria-label="${label}"></span>`
}

export function findPlaceholder(root: HTMLElement | null, id: number): Element | null {
	return root?.querySelector(`[${UPLOAD_ATTR}="${id}"]`) ?? null
}

export function stripUploadPlaceholders(html: string): string {
	if (!html.includes(UPLOAD_ATTR)) return html
	const template = document.createElement('template')
	template.innerHTML = html
	template.content.querySelectorAll(`[${UPLOAD_ATTR}]`).forEach(element => element.remove())
	return template.innerHTML
}

export function mediaHtml(kind: EditorMediaKind, result: EditorUploadAnswer): string {
	const { src, alt = '' } = typeof result === 'string' ? { src: result } : result
	const url = escapeHtml(src)
	if (kind === 'video') return `<video src="${url}" controls style="${VIDEO_STYLE}"></video><br/>`
	return `<img src="${url}" alt="${escapeHtml(alt)}">`
}

export function hasMediaSource(html: string): boolean {
	const template = document.createElement('template')
	template.innerHTML = html
	return template.content.querySelector('[src]') !== null
}
