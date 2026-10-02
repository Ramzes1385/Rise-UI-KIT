import type { CardBrandRef, CardExpiry } from '@utils/form/cardUtils'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления строки `isCompact`: `default` — фон и рамка, `soft` — приглушённый фон, `outline` — только рамка,
 * `ghost` — без фона и рамки (для строк внутри своего списка). Полная карта всегда рисуется лицевой стороной с фоном по марке
 */
export const BANK_CARD_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/** Вариант оформления BaseBankCard */
export type BankCardVariant = (typeof BANK_CARD_VARIANTS)[number]

/**
 * Пропсы компонента BaseBankCard
 */
export interface BaseBankCardProps extends BaseComponentProps<BankCardVariant, 'root' | 'brand' | 'number' | 'expiry' | 'label'> {
	/** Марка: id из `CARD_BRAND_IDS`, своя марка (`defineCardBrand`) или `null` — неизвестна */
	brand?: CardBrandRef | null
	/** Последние 4 цифры номера (`CardInputValue.last4` из BaseCardInput или данные эквайера) */
	last4?: string
	/** Срок действия: `{ month, year }` или строка `ММ/ГГ` */
	expiry?: CardExpiry | string | null
	/** Имя владельца (только в полном виде) */
	holder?: string
	/** Название карты в приложении: «Основная», «Рабочая» (заменяется слотом default) */
	label?: string
	/** Строка для списков выбора вместо полной карты */
	isCompact?: boolean
	/** Карта истекла. По умолчанию — по `expiry` и текущей дате */
	isExpired?: boolean
	/** Официальные знаки марок от приложения: id марки → адрес картинки. Сильнее встроенных значков */
	brandIcons?: Readonly<Record<string, string>>
	/** Свой фон полной карты — значение CSS `background`. По умолчанию — фон по марке */
	background?: string
}

/**
 * Слоты компонента BaseBankCard
 */
export interface BaseBankCardSlots {
	/** Название карты вместо `label` (бейдж «Основная», значок) */
	default?: () => unknown
}
