/** Марки из таблицы кита `CARD_BRANDS` */
export const CARD_BRAND_IDS = [
	'visa',
	'mastercard',
	'mir',
	'maestro',
	'amex',
	'unionpay',
	'jcb',
	'discover',
	'diners',
	'troy',
	'rupay',
	'uzcard',
	'humo',
	'verve',
	'dankort',
	'borica',
	'interpayment',
	'lankapay',
] as const

/** Id марки из таблицы кита */
export type CardBrandId = (typeof CARD_BRAND_IDS)[number]

/**
 * Префикс номера (IIN): строка цифр (`'4'`, `'6011'`) или диапазон одинаковой длины (`[2221, 2720]` — от 2221 до 2720 включительно)
 */
export type CardPrefix = string | readonly [number, number]

/** Код безопасности на обороте карты */
export interface CardSecurityCode {
	/** Название кода у платёжной системы: `CVV2`, `CVC2`, `CID`, `CVP2`… */
	name: string
	/** Число цифр: 3, у American Express — 4 */
	length: number
}

/** Марка карты: как её узнать по номеру, как группировать цифры и какой у неё код */
export interface CardBrand {
	/** Id марки: из `CARD_BRAND_IDS` или свой (`defineCardBrand`) */
	id: string
	/** Название марки — имя собственное латиницей (`Visa`, `Mir`); перевод — в словаре компонента */
	name: string
	/** Префиксы номера; марка определяется по самому длинному совпавшему */
	prefixes: readonly CardPrefix[]
	/**
	 * Префиксы, которые пересекаются с другой маркой (национальные диапазоны RuPay и Troy внутри Discover).
	 * Учитываются, только если марка передана в `brands`; при равной длине такой префикс сильнее обычного
	 */
	sharedPrefixes: readonly CardPrefix[]
	/** Допустимые длины номера, по возрастанию */
	lengths: readonly number[]
	/** После скольких цифр ставится пробел: `[4, 8, 12, 16]` — 4 4 4 4 3, у American Express `[4, 10]` — 4 6 5 */
	gaps: readonly number[]
	/** Код безопасности */
	code: CardSecurityCode
	/** Проверять ли номер алгоритмом Луна; у UnionPay — нет: часть карт его не проходит */
	luhn: boolean
}

/** Описание своей марки для `defineCardBrand`: обязательны `id`, `name` и `prefixes`, остальное — как у большинства марок */
export interface CardBrandInput {
	id: string
	name: string
	prefixes: readonly CardPrefix[]
	/** По умолчанию `[]` */
	sharedPrefixes?: readonly CardPrefix[]
	/** По умолчанию `[16]` */
	lengths?: readonly number[]
	/** По умолчанию `[4, 8, 12, 16]` */
	gaps?: readonly number[]
	/** По умолчанию `{ name: 'CVC', length: 3 }` */
	code?: CardSecurityCode
	/** По умолчанию `true` */
	luhn?: boolean
}

/** Марка по id из таблицы кита или своя марка */
export type CardBrandRef = CardBrandId | CardBrand

/** Какие марки учитывать при разборе номера */
export interface CardBrandOptions {
	/**
	 * Марки, для которых включаются `sharedPrefixes`, и свои марки приложения (`defineCardBrand`).
	 * Своя марка с id из таблицы заменяет марку кита. Остальные марки таблицы тоже распознаются —
	 * чтобы поле могло сказать «Карты American Express не принимаются»
	 */
	brands?: readonly CardBrandRef[]
}

/** Срок действия карты: месяц 1–12 и полный год */
export interface CardExpiry {
	month: number
	year: number
}

/** Марка в разборе номера: `shared` — учитывать её `sharedPrefixes` */
export interface CardBrandPoolEntry {
	brand: CardBrand
	shared: boolean
}
