/** Утилиты: ссылка в редакторе — адрес, текущая ссылка у выделения, вставка и снятие */
import { escapeHtml } from '@utils/dom/htmlUtils'
import { findAncestorByTags } from '@utils/dom/editorDomUtils'
import { isSafeUrl, normalizeLinkUrl } from '@utils/data/urlUtils'
import type { EditorLinkValue, UseToolbarCommandsOptions } from '../types/useToolbarCommands.types'

const NEW_TAB_REL = 'noopener noreferrer'
/** Отступ диалога от верха области ввода, когда выделения не видно */
const FALLBACK_OFFSET = 24

/** Адрес ссылки из введённого текста: `example.com` → `https://example.com`; пустой или небезопасный (`javascript:`) — null */
function resolveLinkUrl(input: string): string | null {
	const url = normalizeLinkUrl(input)
	return url && isSafeUrl(url) ? url : null
}

/** Атрибуты `target` и `rel` ссылки по флагу «в новой вкладке» */
function setLinkTarget(link: HTMLAnchorElement, isNewTab: boolean): void {
	if (isNewTab) {
		link.setAttribute('target', '_blank')
		link.setAttribute('rel', NEW_TAB_REL)
		return
	}
	link.removeAttribute('target')
	if (link.getAttribute('rel') === NEW_TAB_REL) link.removeAttribute('rel')
}

function newTabAttributes(isNewTab: boolean): string {
	return isNewTab ? ` target="_blank" rel="${NEW_TAB_REL}"` : ''
}

/** Ссылка, внутри которой стоит каретка или выделение; в режиме кода ссылок «под выделением» нет */
function findLinkAtSelection(ctx: UseToolbarCommandsOptions): HTMLAnchorElement | null {
	const root = ctx.editorRef.value
	if (!root || ctx.isCodeMode.value) return null
	ctx.ensureSelection()
	const link = findAncestorByTags(window.getSelection()?.anchorNode ?? null, root, ['A'])
	return link instanceof HTMLAnchorElement ? link : null
}

/** Адрес и «в новой вкладке» у ссылки под выделением или null, если выделение не в ссылке */
function readLinkAtSelection(ctx: UseToolbarCommandsOptions): EditorLinkValue | null {
	const link = findLinkAtSelection(ctx)
	return link ? { url: link.getAttribute('href') ?? '', isNewTab: link.getAttribute('target') === '_blank' } : null
}

/** Прямоугольник выделения в визуальном режиме или null, если выделение пустое или его нет */
function getSelectionRect(): DOMRect | null {
	const selection = window.getSelection()
	if (!selection?.rangeCount) return null
	const range = selection.getRangeAt(0)
	const rect = range.getClientRects?.()[0] ?? range.getBoundingClientRect?.()
	return rect && (rect.width || rect.height) ? rect : null
}

/** Точка под выделением (для якоря диалога); без видимого выделения — левый верхний угол области ввода */
function getSelectionPoint(ctx: UseToolbarCommandsOptions): { x: number; y: number } {
	const rect = ctx.isCodeMode.value ? null : getSelectionRect()
	if (rect) return { x: rect.left, y: rect.bottom }
	const box = (ctx.isCodeMode.value ? ctx.getCodeTextarea() : ctx.editorRef.value)?.getBoundingClientRect()
	return { x: box?.left ?? 0, y: (box?.top ?? 0) + FALLBACK_OFFSET }
}

/** Ссылкам, попавшим в выделение, задаёт `target` и `rel` */
function markSelectedLinks(root: HTMLElement, isNewTab: boolean): void {
	const selection = window.getSelection()
	root.querySelectorAll('a').forEach(link => {
		if (selection?.containsNode(link, true)) setLinkTarget(link, isNewTab)
	})
}

/** Ссылка на месте выделения: правит существующую, вставляет адрес как текст при пустом выделении, иначе оборачивает выделение */
function applyVisualLink(ctx: UseToolbarCommandsOptions, value: EditorLinkValue, root: HTMLElement): void {
	const existing = findLinkAtSelection(ctx)
	if (existing) {
		existing.setAttribute('href', value.url)
		setLinkTarget(existing, value.isNewTab)
		return
	}
	if (window.getSelection()?.isCollapsed) {
		const markup = `<a href="${escapeHtml(value.url)}"${newTabAttributes(value.isNewTab)}>${escapeHtml(value.url)}</a>`
		document.execCommand('insertHTML', false, markup)
		return
	}
	document.execCommand('createLink', false, value.url)
	markSelectedLinks(root, value.isNewTab)
}

/** Ставит ссылку на выделение (визуальный режим и режим кода), значение `url` уже проверено `resolveLinkUrl` */
function applyLink(ctx: UseToolbarCommandsOptions, value: EditorLinkValue): void {
	if (ctx.isCodeMode.value) {
		ctx.wrapCodeSelection(`<a href="${escapeHtml(value.url)}"${newTabAttributes(value.isNewTab)}>`, '</a>')
		return
	}
	const root = ctx.editorRef.value
	if (!root || !ctx.restoreSelection()) return
	applyVisualLink(ctx, value, root)
	ctx.saveSelection()
	ctx.onInput()
}

/** Выделяет подряд идущие узлы; пустой список — выделение не меняется */
function selectNodes(nodes: Node[]): void {
	if (nodes.length === 0) return
	const range = document.createRange()
	range.setStartBefore(nodes[0])
	range.setEndAfter(nodes[nodes.length - 1])
	const selection = window.getSelection()
	selection?.removeAllRanges()
	selection?.addRange(range)
}

/** Снимает ссылку под выделением: разворачивает элемент `<a>`, текст остаётся выделенным */
function removeLink(ctx: UseToolbarCommandsOptions): void {
	if (ctx.isCodeMode.value || !ctx.restoreSelection()) return
	const link = findLinkAtSelection(ctx)
	if (!link) {
		document.execCommand('unlink', false)
	} else {
		const children = Array.from(link.childNodes)
		link.replaceWith(...children)
		selectNodes(children)
	}
	ctx.saveSelection()
	ctx.onInput()
}

export { applyLink, getSelectionPoint, readLinkAtSelection, removeLink, resolveLinkUrl }
