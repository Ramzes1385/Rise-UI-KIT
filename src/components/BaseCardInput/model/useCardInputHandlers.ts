import type { Ref } from 'vue'
import type { useCardFields } from './useCardFields'
import { getCardBrand } from '@utils/form/cardUtils'
import type { BaseCardInputProps, CardInputField } from '../types/BaseCardInput.types'
import { caretAfterDigits, digitCount, formatField, isFieldFull } from './card/cardText'

function caretPosition(field: CardInputField, before: string, text: string): number {
	if (field === 'holder') return Math.min(before.length, text.length)
	const typed = field === 'expiry' ? digitCount(formatField('expiry', before, undefined)) : digitCount(before)
	return caretAfterDigits(text, Math.min(typed, digitCount(text)))
}

export function useCardInputHandlers(
	props: BaseCardInputProps,
	fields: ReturnType<typeof useCardFields>,
	rootRef: Ref<HTMLElement | null>,
) {
	const order = (): CardInputField[] =>
		props.hasHolder === false ? ['number', 'expiry', 'code'] : ['number', 'expiry', 'code', 'holder']
	const inputOf = (field: CardInputField): HTMLInputElement | null =>
		rootRef.value?.querySelector<HTMLInputElement>(`[data-card-field="${field}"]`) ?? null
	const focusField = (field: CardInputField | undefined, atEnd = false): void => {
		const input = field ? inputOf(field) : null
		if (!input) return
		input.focus()
		if (atEnd) input.setSelectionRange(input.value.length, input.value.length)
	}
	const sibling = (field: CardInputField, step: number): CardInputField | undefined => order()[order().indexOf(field) + step]

	return {
		focusField,
		handleInput(field: CardInputField, event: Event): void {
			const input = event.target
			if (!(input instanceof HTMLInputElement)) return
			const raw = input.value
			const before = raw.slice(0, input.selectionStart ?? raw.length)
			const brand = field === 'number' ? getCardBrand(raw, fields.options.value) : fields.brand.value
			const text = formatField(field, raw, brand)
			const caret = caretPosition(field, before, text)
			fields.texts[field] = text
			input.value = text
			input.setSelectionRange(caret, caret)
			if (caret === text.length && isFieldFull(field, text, brand)) focusField(sibling(field, 1))
		},
		handleKeydown(field: CardInputField, event: KeyboardEvent): void {
			const input = event.target
			if (event.key !== 'Backspace' || !(input instanceof HTMLInputElement)) return
			if (input.selectionStart !== 0 || input.selectionEnd !== 0) return
			const previous = sibling(field, -1)
			if (!previous) return
			event.preventDefault()
			focusField(previous, true)
		},
	}
}
