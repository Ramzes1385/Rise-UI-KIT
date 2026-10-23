/** Утилиты: состояние контекстного меню медиа в редакторе */
import type { MediaContextMenuState } from '../types/useEditorToolbar.types'

/** Закрытое меню без выбранного элемента */
function createMediaMenuState(): MediaContextMenuState {
	return { isVisible: false, x: 0, y: 0, element: null, width: '', height: '' }
}

/** Изображение или видео, по которому открыто меню, или null для остальных элементов */
function getMediaTarget(event: MouseEvent): HTMLElement | null {
	const target = event.target
	if (!(target instanceof HTMLElement)) return null
	if (target.tagName !== 'IMG' && target.tagName !== 'VIDEO') return null
	return target
}

/** Изображение или видео, выделенное целиком (клик по нему, Shift+стрелка), или null */
function findSelectedMedia(root: HTMLElement | null): HTMLElement | null {
	const selection = window.getSelection()
	if (!root || !selection || selection.rangeCount === 0) return null
	const range = selection.getRangeAt(0)
	const container = range.startContainer
	if (!root.contains(container) || range.endContainer !== container || range.endOffset - range.startOffset !== 1) return null
	const node = container.childNodes[range.startOffset]
	return node instanceof HTMLElement && (node.tagName === 'IMG' || node.tagName === 'VIDEO') ? node : null
}

/** Открывает меню в точке и подставляет текущие размеры элемента */
function openMediaMenuAt(menu: MediaContextMenuState, target: HTMLElement, point: { x: number; y: number }): void {
	menu.isVisible = true
	menu.x = point.x
	menu.y = point.y
	menu.element = target
	const rect = target.getBoundingClientRect()
	menu.width = String(Math.round(rect.width))
	menu.height = String(Math.round(rect.height))
}

/** Открывает меню у курсора мыши */
function openMediaMenu(menu: MediaContextMenuState, target: HTMLElement, event: MouseEvent): void {
	openMediaMenuAt(menu, target, { x: event.clientX, y: event.clientY })
}

/** Открывает меню под элементом по центру: с кнопки панели и с клавиатуры, где курсора мыши нет */
function openMediaMenuBelow(menu: MediaContextMenuState, target: HTMLElement): void {
	const rect = target.getBoundingClientRect()
	openMediaMenuAt(menu, target, { x: rect.left + rect.width / 2, y: rect.bottom })
}

/** Задаёт элементу размеры из полей меню; пустое поле размер не меняет */
function applyMenuSize(menu: MediaContextMenuState, el: HTMLElement): void {
	if (menu.width) el.style.width = menu.width + 'px'
	if (menu.height) el.style.height = menu.height + 'px'
}

export { applyMenuSize, createMediaMenuState, findSelectedMedia, getMediaTarget, openMediaMenu, openMediaMenuBelow }
