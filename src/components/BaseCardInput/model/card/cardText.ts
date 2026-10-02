import type { CardBrand } from '@utils/form/cardUtils'
import type { CardInputField } from '../../types/BaseCardInput.types'
import { cardDigits, cardNumberMaxLength, formatCardNumber, isValidCardNumber } from '@utils/form/cardUtils'

const HOLDER_MAX_LENGTH = 26
const CODE_MAX_LENGTH = 4
const EXPIRY_DIGITS = 4

export function digitCount(text: string): number {
	return cardDigits(text).length
}

export function caretAfterDigits(text: string, count: number): number {
	const ends = [...text].flatMap((char, index) => (/\d/.test(char) ? [index + 1] : []))
	return ends[Math.min(count, ends.length) - 1] ?? 0
}

export function codeLength(brand: CardBrand | undefined): number {
	return brand?.code.length ?? CODE_MAX_LENGTH
}

function formatExpiry(raw: string): string {
	const digits = cardDigits(raw).slice(0, EXPIRY_DIGITS)
	const padded = /^[2-9]/.test(digits) ? `0${digits}`.slice(0, EXPIRY_DIGITS) : digits
	return padded.length > 2 ? `${padded.slice(0, 2)}/${padded.slice(2)}` : padded
}

function formatHolder(raw: string): string {
	return raw.toUpperCase().replace(/\s+/g, ' ').trimStart().slice(0, HOLDER_MAX_LENGTH)
}

export function formatField(field: CardInputField, raw: string, brand: CardBrand | undefined): string {
	if (field === 'number') return formatCardNumber(raw, brand)
	if (field === 'expiry') return formatExpiry(raw)
	if (field === 'code') return cardDigits(raw).slice(0, codeLength(brand))
	return formatHolder(raw)
}

const COMMON_NUMBER_LENGTH = 16

function isNumberFull(text: string, brand: CardBrand | undefined): boolean {
	const count = digitCount(text)
	if (count === cardNumberMaxLength(brand)) return true
	return count === COMMON_NUMBER_LENGTH && brand !== undefined && isValidCardNumber(text)
}

export function isFieldFull(field: CardInputField, text: string, brand: CardBrand | undefined): boolean {
	if (field === 'number') return isNumberFull(text, brand)
	if (field === 'expiry') return digitCount(text) === EXPIRY_DIGITS
	if (field === 'code') return brand !== undefined && text.length === codeLength(brand)
	return false
}
