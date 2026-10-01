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

/** Открывает меню у курсора и подставляет текущие размеры элемента */
function openMediaMenu(menu: MediaContextMenuState, target: HTMLElement, event: MouseEvent): void {
	menu.isVisible = true
	menu.x = event.clientX
	menu.y = event.clientY
	menu.element = target
	const rect = target.getBoundingClientRect()
	menu.width = String(Math.round(rect.width))
	menu.height = String(Math.round(rect.height))
}

/** Задаёт элементу размеры из полей меню; пустое поле размер не меняет */
function applyMenuSize(menu: MediaContextMenuState, el: HTMLElement): void {
	if (menu.width) el.style.width = menu.width + 'px'
	if (menu.height) el.style.height = menu.height + 'px'
}

export { applyMenuSize, createMediaMenuState, getMediaTarget, openMediaMenu }
