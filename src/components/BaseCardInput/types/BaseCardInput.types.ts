import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { InputVariant } from '@components/BaseInput/types/BaseInput.types'
import type { CardBrand, CardBrandOptions, CardBrandRef, CardExpiry } from '@utils/form/cardUtils'

/** Варианты оформления — как у BaseInput: каждое поле карты — BaseInput */
export const CARD_INPUT_VARIANTS = [
	'default',
	'ghost',
	'outline',
	'shadow',
	'soft',
	'filled',
	'underline',
] as const satisfies readonly InputVariant[]

/** Раскладка: `stacked` — номер и имя во всю ширину, срок и код рядом; `inline` — номер, срок и код в одну строку */
export const CARD_INPUT_LAYOUTS = ['stacked', 'inline'] as const

/** Раскладка полей карты */
export type CardInputLayout = (typeof CARD_INPUT_LAYOUTS)[number]

/** Поля карты по порядку перехода */
export const CARD_INPUT_FIELDS = ['number', 'expiry', 'code', 'holder'] as const

/** Поле карты */
export type CardInputField = (typeof CARD_INPUT_FIELDS)[number]

/**
 * Части поля карты для пропа `ui` (БЭМ-элементы `.base-card-input__<часть>`, `root` — `<fieldset>`): legend — подпись группы,
 * preview — карта-превью, preview-inner — поворачиваемая часть, face — сторона карты (лицевая и оборот), chip, face-brand —
 * марка на лицевой стороне, face-number, face-holder, face-expiry, face-caption — подпись «Срок», stripe — магнитная полоса,
 * face-code — код на обороте, fields — сетка полей, number, expiry, code, holder — поля (корни BaseInput), brand — марка
 * в поле номера, brand-image, brand-icon, brand-name — её картинка, значок или название, live — скрытый live-регион марки,
 * error — общая ошибка под полями.
 */
export const CARD_INPUT_PARTS = [
	'legend',
	'preview',
	'preview-inner',
	'face',
	'chip',
	'face-brand',
	'face-number',
	'face-holder',
	'face-expiry',
	'face-caption',
	'stripe',
	'face-code',
	'fields',
	'number',
	'expiry',
	'code',
	'holder',
	'brand',
	'brand-image',
	'brand-icon',
	'brand-name',
	'live',
	'error',
] as const

export type BaseCardInputPart = (typeof CARD_INPUT_PARTS)[number]

/**
 * Значение `v-model` — сводка без номера и кода: её можно хранить в состоянии формы и проверять схемой BaseForm.
 * Сами данные карты отдаёт только `getCardData()` или адаптер `tokenize`
 */
export interface CardInputValue {
	/** Id марки (`visa`, `mir`) или `null`, пока марка не определена */
	brand: string | null
	/** Последние 4 цифры полного номера, иначе пустая строка */
	last4: string
	/** Срок, если введён полностью и верно */
	expiry: CardExpiry | null
	/** Имя владельца латиницей */
	holder: string
	/** Все поля заполнены верно и марка принимается: можно оплачивать */
	isComplete: boolean
}

/** Данные карты для эквайера — только из `getCardData()` и только в `tokenize` */
export interface CardData {
	/** Номер — только цифры */
	number: string
	expiry: CardExpiry
	/** Код безопасности */
	code: string
	holder: string
	brand: CardBrand | undefined
}

/** Адаптер эквайера: данные карты → криптограмма или токен для оплаты на сервере */
export type CardTokenizer = (data: CardData) => Promise<string>

/**
 * Пропсы компонента BaseCardInput
 */
export interface BaseCardInputProps extends BaseComponentProps<
	InputVariant,
	'root' | 'legend' | 'preview' | 'number' | 'expiry' | 'code' | 'holder' | 'brand' | 'error'
> {
	/** Сводка о карте (`v-model`): марка, последние 4 цифры, срок, имя, `isComplete` — без номера и кода */
	modelValue?: CardInputValue | null
	/** Раскладка: `stacked` (по умолчанию) или `inline` */
	layout?: CardInputLayout
	/**
	 * Принимаемые марки: id из `CARD_BRAND_IDS` или свои (`defineCardBrand`). Карта другой марки — ошибка
	 * «Карты … не принимаются». Не задано — принимаются все марки
	 */
	brands?: readonly CardBrandRef[]
	/** Официальные знаки марок от приложения: id марки → адрес картинки. Сильнее встроенных значков */
	brandIcons?: Readonly<Record<string, string>>
	/**
	 * Карта-превью над полями: номер, имя, срок и марка на лицевой стороне; пока фокус в поле кода — оборот с кодом.
	 * Превью скрыто от чтения с экрана (`aria-hidden`): всё то же есть в полях. При `prefers-reduced-motion` — без анимации
	 */
	hasPreview?: boolean
	/** Свой фон превью — значение CSS `background` (градиент, картинка). По умолчанию — фон по марке из `CARD_BRAND_BACKGROUNDS` */
	previewBackground?: string
	/**
	 * Обложка лицевой стороны превью: адрес картинки или значение CSS `background` — как `cover` у BaseBankCard.
	 * Рисуется поверх `previewBackground`; заменяется слотом `previewCover`
	 */
	previewCover?: string
	/** Затемнение поверх обложки превью (токен `--rise-media-scrim`) для контраста AA текста карты; по умолчанию есть */
	hasPreviewCoverOverlay?: boolean
	/** Поле имени владельца (по умолчанию есть) */
	hasHolder?: boolean
	/** Адаптер эквайера для метода `tokenize()` */
	tokenize?: CardTokenizer
	/** Подпись группы полей; без неё группа называется подписью BaseFormField или скрытым «Банковская карта» */
	label?: string
	/** Общая ошибка под полями (например, от эквайера) */
	error?: string
	/** Все поля обязательны (`aria-required`) */
	isRequired?: boolean
	/** Отключает поля */
	isDisabled?: boolean
	/**
	 * Классы частей (`root`, `preview`, `face`, `fields`, `number`, `brand`… — см. `CARD_INPUT_PARTS`) — добавляются к классам кита.
	 * `number`, `expiry`, `code`, `holder` — корни полей BaseInput. Глобально — `defaults.BaseCardInput.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BaseCardInput :ui="{ face: 'shadow-lg', fields: 'gap-4', brand: 'opacity-80' }" />
	 */
	ui?: UiProp<BaseCardInputPart>
}

/**
 * Слоты компонента BaseCardInput
 */
export interface BaseCardInputSlots {
	/** Своё содержимое обложки лицевой стороны превью вместо `previewCover` (при `hasPreview`) */
	previewCover?: () => unknown
}

/**
 * События компонента BaseCardInput
 */
export interface BaseCardInputEmits {
	/** Сводка о карте при любом изменении полей */
	(event: 'update:modelValue', value: CardInputValue): void
	/** Все поля заполнены верно: можно вызывать `tokenize()` */
	(event: 'complete', value: CardInputValue): void
}

/** Методы BaseCardInput через `ref` */
export interface BaseCardInputExpose {
	/** Данные карты или `null`, если поля заполнены не полностью или неверно. Нигде не сохраняются */
	getCardData: () => CardData | null
	/** Передать данные карты адаптеру `tokenize`; без адаптера или с неполными данными — ошибка (Promise отклоняется) */
	tokenize: () => Promise<string>
	/** Показать ошибки всех полей; `true` — карта готова к оплате */
	validate: () => boolean
	/** Очистить поля и ошибки */
	reset: () => void
	/** Фокус на поле (по умолчанию — первое незаполненное) */
	focus: (field?: CardInputField) => void
}

/** Что нужно для проверки полей: марка номера, марки для разбора, принимаемые id (`null` — все), есть ли имя, текущая дата */
export interface CardCheckContext {
	brand: CardBrand | undefined
	options: CardBrandOptions
	acceptedIds: ReadonlySet<string> | null
	hasHolder: boolean
	now: Date
}
