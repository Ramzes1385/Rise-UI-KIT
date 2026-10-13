/** Утилиты: безопасное приведение DOM-типов и координаты fixed-элементов */
import type { FixedOrigin } from './types/domUtils.types'

export function toHTMLElement(target: EventTarget | null): HTMLElement | null {
	if (target instanceof HTMLElement) return target
	return null
}

export function toHTMLInputElement(target: EventTarget | null): HTMLInputElement | null {
	if (target instanceof HTMLInputElement) return target
	return null
}

export function toHTMLTextAreaElement(target: EventTarget | null): HTMLTextAreaElement | null {
	if (target instanceof HTMLTextAreaElement) return target
	return null
}

export function getActiveElement(): HTMLElement | null {
	if (document.activeElement instanceof HTMLElement) return document.activeElement
	return null
}

/** Свойства, которые при значении, отличном от `none`, создают систему координат для fixed-потомков */
const NONE_PROPERTIES = ['transform', 'translate', 'rotate', 'scale', 'perspective', 'filter', 'backdrop-filter']

/** Значение CSS-свойства задано: пустая строка (jsdom) и значение по умолчанию не считаются */
function isSet(value: string, initial: string): boolean {
	return value !== '' && value !== initial
}

/**
 * Предок создаёт систему координат для `position: fixed` потомков: трансформация, перспектива, фильтр,
 * сдерживание раскладки (`contain`, `container-type`) или обещание их в `will-change`
 */
function isFixedContainer(style: CSSStyleDeclaration): boolean {
	const value = (name: string): string => style.getPropertyValue(name)
	return (
		NONE_PROPERTIES.some(name => isSet(value(name), 'none')) ||
		/paint|layout|strict|content/.test(value('contain')) ||
		/size/.test(value('container-type')) ||
		/transform|perspective|filter/.test(value('will-change'))
	)
}

/** Элемент в верхнем слое (во весь экран): его потомки отсчитываются от окна, предки не влияют */
function isTopLayer(element: Element): boolean {
	return document.fullscreenElement === element
}

/**
 * Где на экране начало координат для `position: fixed` потомков `container`. Обычно это окно — `{ x: 0, y: 0 }`.
 * Но если у `container` или его предка есть `transform`, `filter`, `contain` и т. п., fixed-элемент
 * отсчитывается от этого предка: так Storybook на странице Docs оборачивает истории, так же ведут себя
 * анимированные окна и слайдеры. Координаты из `getBoundingClientRect` (окно) переводятся в координаты
 * для `top`/`left` вычитанием этой точки.
 *
 * @example
 * ```ts
 * const origin = getFixedOrigin(panel.parentElement)
 * panel.style.top = `${rect.bottom - origin.y}px`
 * ```
 */
export function getFixedOrigin(container: Element | null | undefined): FixedOrigin {
	for (let node = container; node && node !== document.documentElement; node = node.parentElement) {
		if (isFixedContainer(getComputedStyle(node))) {
			const rect = node.getBoundingClientRect()
			return { x: rect.left + node.clientLeft - node.scrollLeft, y: rect.top + node.clientTop - node.scrollTop }
		}
		if (isTopLayer(node)) break
	}
	return { x: 0, y: 0 }
}

function normalizeText(value: string | null | undefined): string {
	return (value ?? '').replace(/\s+/g, ' ').trim()
}

/** Доступное имя элемента в упрощённом виде: `aria-labelledby`, затем `aria-label`, затем видимый текст */
export function getAccessibleName(element: Element | null): string {
	if (!element) return ''
	const labelledBy = element.getAttribute('aria-labelledby')
	if (labelledBy) {
		const text = labelledBy
			.split(/\s+/)
			.map(id => normalizeText(element.ownerDocument.getElementById(id)?.textContent))
			.filter(Boolean)
			.join(' ')
		if (text) return text
	}
	return normalizeText(element.getAttribute('aria-label')) || normalizeText(element.textContent)
}
