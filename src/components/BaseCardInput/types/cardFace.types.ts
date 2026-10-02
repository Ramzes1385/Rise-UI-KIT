import type { CardBrand } from '@utils/form/cardUtils'

/** Фон лицевой стороны без марки и у марок без своего фона: тёмный градиент нейтральной палитры */
export const CARD_FACE_DEFAULT_BACKGROUND = 'linear-gradient(135deg, var(--rise-color-neutral-700), var(--rise-color-neutral-950))'

/**
 * Фоны карты по марке — градиенты токенов палитры (тёмные оттенки: светлый текст читается в обеих темах).
 * Это не фирменные цвета платёжных систем, а близкие им оттенки кита; свой фон — проп `previewBackground` или `background`
 */
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

/**
 * Пропсы значка марки CardBrandMark (внутренний компонент превью BaseCardInput и BaseBankCard)
 */
export interface CardBrandMarkProps {
	/** Марка карты */
	brand: CardBrand
	/** Официальные знаки марок от приложения: id марки → адрес картинки */
	brandIcons?: Readonly<Record<string, string>>
}
