/**
 * Пропсы обложки CardCover (внутренний компонент BaseBankCard, общий с превью BaseCardInput)
 */
export interface CardCoverProps {
	/** Адрес картинки или значение CSS `background` (градиент, цвет) */
	cover?: string
	/** Затемнение поверх обложки, чтобы светлый текст карты читался (контраст AA на любой картинке) */
	hasOverlay?: boolean
}

/**
 * Слоты обложки CardCover
 */
export interface CardCoverSlots {
	/** Своё содержимое обложки вместо `cover` */
	default?: () => unknown
}
