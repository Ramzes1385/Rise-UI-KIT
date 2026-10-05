/**
 * Утилиты: лицо банковской карты — маска номера, фон по марке, обложка, название марки для подписей.
 * Внутренний модуль: общий для BaseCardInput и BaseBankCard, в публичный вход `utils` не входит
 */

import { UI_CARD } from '@/locales/messages'
import type { CardBrand } from '@utils/form/cardUtils'
import type { CardCoverLayer } from './types/cardFaceUtils.types'

const DEFAULT_GAPS: readonly number[] = [4, 8, 12, 16]
const DEFAULT_LENGTH = 16

/** Знак скрытой цифры на лице карты */
export const CARD_FACE_DOT = '•'

/** Фон лица карты без марки или для марки без своего фона */
export const CARD_FACE_DEFAULT_BACKGROUND = 'linear-gradient(135deg, var(--rise-color-neutral-700), var(--rise-color-neutral-950))'

/** Фоны лица карты по id марки — градиенты на токенах палитры */
export const CARD_BRAND_BACKGROUNDS: Readonly<Record<string, string>> = {
	visa: 'linear-gradient(135deg, var(--rise-color-info-700), var(--rise-color-info-950))',
	mastercard: 'linear-gradient(135deg, var(--rise-color-neutral-800), var(--rise-color-primary-900))',
	mir: 'linear-gradient(135deg, var(--rise-color-success-700), var(--rise-color-info-900))',
	maestro: 'linear-gradient(135deg, var(--rise-color-info-800), var(--rise-color-error-900))',
	amex: 'linear-gradient(135deg, var(--rise-color-info-700), var(--rise-color-info-900))',
	unionpay: 'linear-gradient(135deg, var(--rise-color-error-800), var(--rise-color-info-900))',
	jcb: 'linear-gradient(135deg, var(--rise-color-success-800), var(--rise-color-info-900))',
	discover: 'linear-gradient(135deg, var(--rise-color-warning-800), var(--rise-color-primary-950))',
	diners: 'linear-gradient(135deg, var(--rise-color-neutral-600), var(--rise-color-neutral-900))',
}

/** Название марки для подписей и сообщений: «Мир» — из словаря, остальные — `brand.name` */
export function cardBrandName(brand: CardBrand): string {
	return brand.id === 'mir' ? UI_CARD.BRAND_MIR : brand.name
}

function groupCardChars(chars: string, brand: CardBrand | undefined): string {
	const gaps = brand?.gaps ?? DEFAULT_GAPS
	return [...chars].map((char, index) => (index > 0 && gaps.includes(index) ? ` ${char}` : char)).join('')
}

function cardFaceLength(brand: CardBrand | undefined): number {
	const [shortest] = brand?.lengths ?? []
	if (shortest === undefined || brand?.lengths.includes(DEFAULT_LENGTH)) return DEFAULT_LENGTH
	return shortest
}

/** Номер на лице карты: введённые цифры, остаток до длины марки — точками, группы — как у марки */
export function maskedCardNumber(digits: string, brand: CardBrand | undefined): string {
	return groupCardChars(digits.padEnd(cardFaceLength(brand), CARD_FACE_DOT), brand)
}

/** Фон лица карты: свой фон приложения, иначе фон марки, иначе общий */
export function cardFaceBackground(brand: CardBrand | undefined, custom: string | undefined): string {
	if (custom) return custom
	return (brand && CARD_BRAND_BACKGROUNDS[brand.id]) || CARD_FACE_DEFAULT_BACKGROUND
}

const COVER_IMAGE_PREFIX = /^(?:https?:|data:image\/|blob:|\/|\.{1,2}\/)/i
const COVER_IMAGE_EXTENSION = /\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i

/**
 * Обложка карты по значению `cover`: адрес картинки (`https:`, `data:image/`, `blob:`, путь от корня или относительный,
 * имя файла картинки без скобок) — картинкой, остальное (градиент, цвет, `url(…)`) — как CSS `background`
 */
export function cardCoverLayer(cover: string | undefined): CardCoverLayer {
	const value = cover?.trim()
	if (!value) return {}
	if (COVER_IMAGE_PREFIX.test(value)) return { image: value }
	if (value.includes('(') || !COVER_IMAGE_EXTENSION.test(value)) return { fill: value }
	return { image: value }
}
