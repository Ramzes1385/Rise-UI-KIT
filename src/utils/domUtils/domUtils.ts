/**
 * Утилиты для безопасного приведения DOM-типов.
 */

/**
 * Безопасно привести EventTarget к HTMLElement.
 * Возвращает null если target не является HTMLElement.
 */
export function toHTMLElement(target: EventTarget | null): HTMLElement | null {
	if (target instanceof HTMLElement) return target
	return null
}

/**
 * Безопасно привести EventTarget к HTMLInputElement.
 * Возвращает null если target не является HTMLInputElement.
 */
export function toHTMLInputElement(target: EventTarget | null): HTMLInputElement | null {
	if (target instanceof HTMLInputElement) return target
	return null
}

/**
 * Безопасно привести EventTarget к HTMLTextAreaElement.
 * Возвращает null если target не является HTMLTextAreaElement.
 */
export function toHTMLTextAreaElement(target: EventTarget | null): HTMLTextAreaElement | null {
	if (target instanceof HTMLTextAreaElement) return target
	return null
}

/**
 * Безопасно получить document.activeElement как HTMLElement.
 * Возвращает null если activeElement не является HTMLElement.
 */
export function getActiveElement(): HTMLElement | null {
	if (document.activeElement instanceof HTMLElement) return document.activeElement
	return null
}
