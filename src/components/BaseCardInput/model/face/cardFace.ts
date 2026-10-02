import type { CardBrand } from '@utils/form/cardUtils'
import { CARD_BRAND_BACKGROUNDS, CARD_FACE_DEFAULT_BACKGROUND } from '../../types/cardFace.types'

const DEFAULT_GAPS: readonly number[] = [4, 8, 12, 16]
const DEFAULT_LENGTH = 16
export const CARD_FACE_DOT = '•'

function groupCardChars(chars: string, brand: CardBrand | undefined): string {
	const gaps = brand?.gaps ?? DEFAULT_GAPS
	return [...chars].map((char, index) => (index > 0 && gaps.includes(index) ? ` ${char}` : char)).join('')
}

function cardFaceLength(brand: CardBrand | undefined): number {
	if (!brand || brand.lengths.includes(DEFAULT_LENGTH)) return DEFAULT_LENGTH
	return brand.lengths[0] ?? DEFAULT_LENGTH
}

export function maskedCardNumber(digits: string, brand: CardBrand | undefined): string {
	return groupCardChars(digits.padEnd(cardFaceLength(brand), CARD_FACE_DOT), brand)
}

export function cardFaceBackground(brand: CardBrand | undefined, custom: string | undefined): string {
	if (custom) return custom
	return (brand && CARD_BRAND_BACKGROUNDS[brand.id]) || CARD_FACE_DEFAULT_BACKGROUND
}
