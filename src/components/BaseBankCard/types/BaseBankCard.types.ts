import type { UiProp } from '@composables/base/useUi'
import type { CardBrandRef, CardExpiry } from '@utils/form/cardUtils'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления строки `isCompact`: `default` — тональный фон без рамки, `soft` — более светлый тон, `outline` — только рамка,
 * `ghost` — без фона и рамки (для строк внутри своего списка), `shadow` — фон поверхности и тень.
 * Полная карта всегда рисуется лицевой стороной с фоном по марке: по умолчанию без тени, `shadow` добавляет её
 */
export const BANK_CARD_VARIANTS = ['default', 'soft', 'outline', 'ghost', 'shadow'] as const

/** Вариант оформления BaseBankCard */
export type BankCardVariant = (typeof BANK_CARD_VARIANTS)[number]

/**
 * Части карты для пропа `ui` (БЭМ-элементы `.base-bank-card__<часть>`, `root` — сама карта):
 * summary — скрытое описание для скринридера, brand — марка (в `isCompact` — мини-карта), label — название карты,
 * number — маска номера, holder — владелец, expiry — срок действия, expired — метка «Истекла».
 */
export const BANK_CARD_PARTS = ['summary', 'brand', 'label', 'number', 'holder', 'expiry', 'expired'] as const

/** Часть BaseBankCard для пропа `ui` */
export type BaseBankCardPart = (typeof BANK_CARD_PARTS)[number]

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
	/**
	 * Обложка карты: адрес картинки (`https:`, `data:image/`, `blob:`, путь) или значение CSS `background` (градиент, цвет).
	 * Рисуется поверх фона (`background` или фона марки виден, пока картинка грузится или если она не загрузилась).
	 * В полном виде — на всей карте, в `isCompact` — на мини-карте вместо плашки марки. Заменяется слотом `cover`
	 */
	cover?: string
	/**
	 * Затемнение поверх обложки (токен `--rise-media-scrim`): светлый текст карты читается на любой картинке с контрастом AA.
	 * Выключайте только для своей тёмной обложки, проверив контраст
	 */
	hasCoverOverlay?: boolean
	/**
	 * Классы частей карты (`root`, `summary`, `brand`, `label`, `number`, `holder`, `expiry`, `expired`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseBankCard: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseBankCard brand="mir" last4="4242" :ui="{ root: 'shadow-xl', number: 'tracking-widest' }" />
	 */
	ui?: UiProp<BaseBankCardPart>
}

/**
 * Слоты компонента BaseBankCard
 */
export interface BaseBankCardSlots {
	/** Название карты вместо `label` (бейдж «Основная», значок) */
	default?: () => unknown
	/** Своё содержимое обложки вместо `cover`: картинка с `srcset`, `<picture>`, узор. Растягивается на всю карту, затемнение — как у `cover` */
	cover?: () => unknown
}
