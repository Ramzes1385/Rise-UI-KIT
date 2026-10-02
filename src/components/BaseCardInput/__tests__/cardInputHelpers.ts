import { nextTick } from 'vue'
import type { CardInputField } from '../types/BaseCardInput.types'

export function field(container: Element, name: CardInputField): HTMLInputElement {
	return container.querySelector(`[data-card-field="${name}"]`) as HTMLInputElement
}

export async function typeInto(input: HTMLInputElement, value: string, caret = value.length): Promise<void> {
	input.value = value
	input.setSelectionRange(caret, caret)
	input.dispatchEvent(new Event('input', { bubbles: true }))
	await nextTick()
}

export function pressBackspace(input: HTMLInputElement, key = 'Backspace'): boolean {
	const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
	input.dispatchEvent(event)
	return event.defaultPrevented
}

export async function fillValidCard(container: Element, holder = 'IVAN IVANOV'): Promise<void> {
	await typeInto(field(container, 'number'), '4242424242424242')
	await typeInto(field(container, 'expiry'), `12${String(new Date().getFullYear() + 4).slice(2)}`)
	await typeInto(field(container, 'code'), '123')
	if (field(container, 'holder')) await typeInto(field(container, 'holder'), holder)
}
