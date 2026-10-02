/** Утилиты: таблица марок банковских карт и описание своей марки */
import type { CardBrand, CardBrandId, CardBrandInput } from './types/cardUtils.types'

const DEFAULT_GAPS = [4, 8, 12, 16] as const
const DEFAULT_CODE = { name: 'CVC', length: 3 } as const

/** Марка из описания: недостающие поля — как у большинства марок (16 цифр, 4 4 4 4, код из 3 цифр, Луна) */
export function defineCardBrand(input: CardBrandInput): CardBrand {
	return Object.freeze({
		id: input.id,
		name: input.name,
		prefixes: Object.freeze([...input.prefixes]),
		sharedPrefixes: Object.freeze([...(input.sharedPrefixes ?? [])]),
		lengths: Object.freeze([...(input.lengths ?? [16])].sort((a, b) => a - b)),
		gaps: Object.freeze([...(input.gaps ?? DEFAULT_GAPS)]),
		code: Object.freeze({ ...(input.code ?? DEFAULT_CODE) }),
		luhn: input.luhn ?? true,
	})
}

function lengthRange(from: number, to: number): number[] {
	return Array.from({ length: to - from + 1 }, (_, index) => from + index)
}

/*
 * Источники диапазонов IIN, длин и группировки:
 * - Wikipedia, «Payment card number», таблица «Issuer identification number (IIN)»:
 *   https://en.wikipedia.org/wiki/Payment_card_number (сверено 02.10.2026);
 * - названия кодов безопасности — Wikipedia, «Card security code»: https://en.wikipedia.org/wiki/Card_security_code.
 * Данные — факты из открытых таблиц, сторонний код и наборы данных не использовались.
 * Пересечения: Verve 650002–650027 и Troy 65 лежат внутри Discover 65, LankaPay 357111 — внутри JCB 3528–3589;
 * более длинный префикс сильнее, а национальные 60 и 65 у RuPay и 65 у Troy — `sharedPrefixes`.
 */
const KIT_BRANDS: readonly (CardBrandInput & { id: CardBrandId })[] = [
	{ id: 'visa', name: 'Visa', prefixes: ['4'], lengths: [13, 16, 19], code: { name: 'CVV2', length: 3 } },
	{
		id: 'mastercard',
		name: 'Mastercard',
		prefixes: [
			[51, 55],
			[2221, 2720],
		],
		code: { name: 'CVC2', length: 3 },
	},
	{ id: 'mir', name: 'Mir', prefixes: [[2200, 2204]], lengths: lengthRange(16, 19), code: { name: 'CVP2', length: 3 } },
	{
		id: 'maestro',
		name: 'Maestro',
		prefixes: ['5018', '5020', '5038', '5893', '6304', '6759', '6761', '6762', '6763', '676770', '676774'],
		lengths: lengthRange(12, 19),
		code: { name: 'CVC2', length: 3 },
	},
	{ id: 'amex', name: 'American Express', prefixes: ['34', '37'], lengths: [15], gaps: [4, 10], code: { name: 'CID', length: 4 } },
	{ id: 'unionpay', name: 'UnionPay', prefixes: ['62'], lengths: lengthRange(16, 19), code: { name: 'CVN2', length: 3 }, luhn: false },
	{ id: 'jcb', name: 'JCB', prefixes: [[3528, 3589]], lengths: lengthRange(16, 19), code: { name: 'CAV2', length: 3 } },
	{
		id: 'discover',
		name: 'Discover',
		prefixes: ['6011', [644, 649], '65'],
		lengths: lengthRange(16, 19),
		code: { name: 'CID', length: 3 },
	},
	{
		id: 'diners',
		name: 'Diners Club',
		prefixes: ['30', '36', '38', '39'],
		lengths: lengthRange(14, 19),
		gaps: [4, 10],
		code: { name: 'CVV', length: 3 },
	},
	{ id: 'troy', name: 'Troy', prefixes: ['9792'], sharedPrefixes: ['65'], code: { name: 'CVV', length: 3 } },
	{ id: 'rupay', name: 'RuPay', prefixes: ['81', '82', '508'], sharedPrefixes: ['60', '65'], code: { name: 'CVV', length: 3 } },
	{ id: 'uzcard', name: 'UzCard', prefixes: ['8600', '5614'] },
	{ id: 'humo', name: 'HUMO', prefixes: ['9860'] },
	{
		id: 'verve',
		name: 'Verve',
		prefixes: [
			[506099, 506198],
			[507865, 507964],
			[650002, 650027],
		],
		lengths: [16, 18, 19],
		code: { name: 'CVV', length: 3 },
	},
	{ id: 'dankort', name: 'Dankort', prefixes: ['5019'], code: { name: 'CVV', length: 3 } },
	{ id: 'borica', name: 'BORICA', prefixes: ['2205'], code: { name: 'CVV', length: 3 } },
	{ id: 'interpayment', name: 'InterPayment', prefixes: ['636'], lengths: lengthRange(16, 19), code: { name: 'CVV', length: 3 } },
	{ id: 'lankapay', name: 'LankaPay', prefixes: ['357111'], code: { name: 'CVV', length: 3 } },
]

/** Таблица марок кита в порядке `CARD_BRAND_IDS` */
export const CARD_BRANDS: readonly CardBrand[] = Object.freeze(KIT_BRANDS.map(defineCardBrand))
