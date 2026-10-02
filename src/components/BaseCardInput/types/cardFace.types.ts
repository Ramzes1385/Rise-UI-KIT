import type { CardBrand } from '@utils/form/cardUtils'

/**
 * Пропсы значка марки CardBrandMark (внутренний компонент превью BaseCardInput и BaseBankCard)
 */
export interface CardBrandMarkProps {
	/** Марка карты */
	brand: CardBrand
	/** Официальные знаки марок от приложения: id марки → адрес картинки */
	brandIcons?: Readonly<Record<string, string>>
}
