import { codeLength } from './cardText'
import { formatMessage } from '@/locales/state'
import { UI_CARD, UI_TEXT } from '@/locales/messages'
import { cardBrandName } from '@utils/form/cardFaceUtils'
import type { CardCheckContext, CardInputField } from '../../types/BaseCardInput.types'
import { cardDigits, isValidCardNumber, isValidExpiry, parseCardExpiry } from '@utils/form/cardUtils'

const HOLDER_PATTERN = /^[A-Z][A-Z .'-]*$/

function numberError(text: string, context: CardCheckContext): string | null {
	const { brand, acceptedIds } = context
	if (brand && acceptedIds && !acceptedIds.has(brand.id))
		return formatMessage(UI_CARD.BRAND_NOT_ACCEPTED, { brand: cardBrandName(brand) })
	return isValidCardNumber(cardDigits(text), context.options) ? null : UI_CARD.NUMBER_INVALID
}

function expiryError(text: string, now: Date): string | null {
	const expiry = parseCardExpiry(text)
	if (!expiry) return UI_CARD.EXPIRY_INVALID
	if (isValidExpiry(expiry, now)) return null
	const isPast = expiry.year * 12 + expiry.month <= now.getFullYear() * 12 + now.getMonth()
	return isPast ? UI_CARD.EXPIRY_PAST : UI_CARD.EXPIRY_INVALID
}

function holderError(text: string): string | null {
	return HOLDER_PATTERN.test(text.trim()) ? null : UI_CARD.HOLDER_INVALID
}

export function cardFieldError(field: CardInputField, text: string, context: CardCheckContext): string | null {
	if (field === 'holder' && !context.hasHolder) return null
	if (text.trim() === '') return UI_TEXT.REQUIRED_FIELD
	if (field === 'number') return numberError(text, context)
	if (field === 'expiry') return expiryError(text, context.now)
	if (field === 'code') {
		const count = codeLength(context.brand)
		return text.length === count ? null : formatMessage(UI_CARD.CODE_INVALID, { count })
	}
	return holderError(text)
}
