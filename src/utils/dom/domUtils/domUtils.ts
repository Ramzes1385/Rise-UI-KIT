/** Утилиты: безопасное приведение DOM-типов и координаты fixed-элементов */
import type { FixedBounds, FixedOrigin } from './types/domUtils.types'

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
	return element.ownerDocument.fullscreenElement === element
}

/** Вычисленный стиль в окне документа элемента (iframe, Picture-in-Picture), а не глобального `window` */
function getStyleIn(node: Element): CSSStyleDeclaration {
	return (node.ownerDocument.defaultView ?? window).getComputedStyle(node)
}

/** Масштаб предка по одной оси: отношение размера в окне к размеру в единицах предка (`transform: scale`, `zoom`) */
function getAxisScale(rendered: number, layout: number): number {
	if (!layout || !rendered) return 1
	return rendered / layout
}

/**
 * Где на экране начало координат для `position: fixed` потомков `container` и во сколько раз единицы предка
 * отличаются от пикселей окна. Обычно это окно без масштаба — `{ x: 0, y: 0, scaleX: 1, scaleY: 1 }`.
 * Но если у `container` или его предка есть `transform`, `filter`, `contain` и т. п., fixed-элемент
 * отсчитывается от этого предка: так Storybook на странице Docs оборачивает истории, так же ведут себя
 * анимированные окна и слайдеры. Если у предка ещё и `transform: scale(…)` или `zoom`, `top`/`left` панели
 * измеряются в его единицах, а `getBoundingClientRect` — в пикселях окна: `scaleX`/`scaleY` — это отношение.
 * Координаты окна переводятся в `top`/`left` через `toFixedSpace`. Прокрутка предка в `dir="rtl"` (`scrollLeft`
 * отрицательный) отдельного учёта не требует: знак уже даёт сдвиг в нужную сторону.
 *
 * @example
 * ```ts
 * const origin = getFixedOrigin(panel.parentElement)
 * const { x, y } = toFixedSpace(origin, rect.left, rect.bottom)
 * panel.style.top = `${y}px`
 * ```
 */
export function getFixedOrigin(container: Element | null | undefined): FixedOrigin {
	for (let node = container; node && node !== node.ownerDocument.documentElement; node = node.parentElement) {
		if (isFixedContainer(getStyleIn(node))) {
			const rect = node.getBoundingClientRect()
			const scaleX = getAxisScale(rect.width, (node as HTMLElement).offsetWidth)
			const scaleY = getAxisScale(rect.height, (node as HTMLElement).offsetHeight)
			return {
				x: rect.left + (node.clientLeft - node.scrollLeft) * scaleX,
				y: rect.top + (node.clientTop - node.scrollTop) * scaleY,
				scaleX,
				scaleY,
			}
		}
		if (isTopLayer(node)) break
	}
	return { x: 0, y: 0, scaleX: 1, scaleY: 1 }
}

/** Точка окна в координатах `top`/`left` fixed-потомка предка из `getFixedOrigin`: со сдвигом начала и учётом масштаба */
export function toFixedSpace(origin: FixedOrigin, x: number, y: number): { x: number; y: number } {
	return { x: (x - origin.x) / origin.scaleX, y: (y - origin.y) / origin.scaleY }
}

/** Атрибут предка, который задаёт границы для подсказок и панелей внутри него (плеер): они сдвигаются внутрь его рамки */
const BOUNDS_ATTRIBUTE = 'data-rise-bounds'

/**
 * Границы для подсказок внутри `container`: рамка ближайшего предка с атрибутом `data-rise-bounds` (в координатах окна).
 * `null` — предка нет, границы — окно. Подсказки кита сдвигаются внутрь этой рамки: у края плеера подсказка не выходит за него.
 *
 * @example
 * // <div data-rise-bounds> … <BaseTooltip> … </div>
 * const bounds = getBoundsRect(tooltip.parentElement)
 */
export function getBoundsRect(container: Element | null | undefined): FixedBounds | null {
	const node = container?.closest(`[${BOUNDS_ATTRIBUTE}]`)
	if (!node) return null
	const rect = node.getBoundingClientRect()
	return { x: rect.left + node.clientLeft, y: rect.top + node.clientTop, width: node.clientWidth, height: node.clientHeight }
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
