import type { CardBrand } from '@utils/form/cardUtils'

/**
 * Пропсы значка марки CardBrandMark (внутренний компонент BaseBankCard, общий с превью BaseCardInput)
 */
export interface CardBrandMarkProps {
	/** Марка карты */
	brand: CardBrand
	/** Официальные знаки марок от приложения: id марки → адрес картинки */
	brandIcons?: Readonly<Record<string, string>>
}
