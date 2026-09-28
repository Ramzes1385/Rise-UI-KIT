/** Утилиты: безопасное приведение DOM-типов */

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
