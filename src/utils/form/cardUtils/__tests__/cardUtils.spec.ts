import type { CardBrand, CardBrandId } from '..'
import {
	CARD_BRAND_IDS,
	CARD_BRANDS,
	cardDigits,
	cardNumberMaxLength,
	defineCardBrand,
	formatCardNumber,
	getCardBrand,
	isLuhnValid,
	isValidCardNumber,
	isValidExpiry,
	parseCardExpiry,
} from '..'

/** Тестовые номера эквайеров (Stripe, CloudPayments) и номера с верной суммой Луна на префиксах марок */
const BRAND_NUMBERS: [CardBrandId, string][] = [
	['visa', '4242424242424242'],
	['mastercard', '5555555555554444'],
	['mir', '2200000000000004'],
	['maestro', '6759649826438453'],
	['amex', '378282246310005'],
	['unionpay', '6200000000000005'],
	['jcb', '3530111333300000'],
	['discover', '6011111111111117'],
	['diners', '30569309025904'],
	['troy', '9792000000000003'],
	['rupay', '8100000000000002'],
	['uzcard', '8600000000000007'],
	['humo', '9860000000000000'],
	['verve', '5061000000000005'],
	['dankort', '5019000000000008'],
	['borica', '2205000000000009'],
	['interpayment', '6360000000000001'],
	['lankapay', '3571110000000000'],
]

function brand(id: CardBrandId): CardBrand {
	return CARD_BRANDS.find(item => item.id === id) as CardBrand
}

describe('cardUtils', () => {
	describe('CARD_BRANDS', () => {
		it('18 марок в порядке CARD_BRAND_IDS, все заморожены', () => {
			expect(CARD_BRANDS.map(item => item.id)).toEqual([...CARD_BRAND_IDS])
			expect(CARD_BRANDS).toHaveLength(18)
			expect(Object.isFrozen(CARD_BRANDS)).toBe(true)
			for (const item of CARD_BRANDS) {
				expect(Object.isFrozen(item)).toBe(true)
				expect(Object.isFrozen(item.prefixes)).toBe(true)
				expect(Object.isFrozen(item.lengths)).toBe(true)
				expect(Object.isFrozen(item.code)).toBe(true)
			}
		})

		it('у American Express код CID из 4 цифр и группы 4 6 5, у UnionPay нет проверки Луна', () => {
			expect(brand('amex').code).toEqual({ name: 'CID', length: 4 })
			expect(brand('amex').gaps).toEqual([4, 10])
			expect(brand('unionpay').luhn).toBe(false)
			expect(brand('visa').lengths).toEqual([13, 16, 19])
		})
	})

	describe('defineCardBrand', () => {
		it('недостающие поля — по умолчанию', () => {
			expect(defineCardBrand({ id: 'local', name: 'Local', prefixes: ['77'] })).toEqual({
				id: 'local',
				name: 'Local',
				prefixes: ['77'],
				sharedPrefixes: [],
				lengths: [16],
				gaps: [4, 8, 12, 16],
				code: { name: 'CVC', length: 3 },
				luhn: true,
			})
		})

		it('длины сортируются, заданные поля сохраняются', () => {
			const local = defineCardBrand({
				id: 'local',
				name: 'Local',
				prefixes: [[770, 779]],
				sharedPrefixes: ['60'],
				lengths: [19, 16, 18],
				gaps: [4, 8],
				code: { name: 'CVV', length: 4 },
				luhn: false,
			})
			expect(local.lengths).toEqual([16, 18, 19])
			expect(local.sharedPrefixes).toEqual(['60'])
			expect(local.gaps).toEqual([4, 8])
			expect(local.code).toEqual({ name: 'CVV', length: 4 })
			expect(local.luhn).toBe(false)
		})

		it('результат заморожен, а массивы скопированы: правка исходных не меняет марку', () => {
			const prefixes = ['77']
			const lengths = [16]
			const code = { name: 'CVC', length: 3 }
			const local = defineCardBrand({ id: 'local', name: 'Local', prefixes, lengths, code })
			prefixes.push('78')
			lengths.push(19)
			code.length = 4
			expect(local.prefixes).toEqual(['77'])
			expect(local.lengths).toEqual([16])
			expect(local.code.length).toBe(3)
			expect(Object.isFrozen(local)).toBe(true)
			expect(Object.isFrozen(local.gaps)).toBe(true)
			expect(Object.isFrozen(local.sharedPrefixes)).toBe(true)
		})
	})

	describe('getCardBrand', () => {
		it.each(BRAND_NUMBERS)('%s — по номеру %s', (id, number) => {
			expect(getCardBrand(number)?.id).toBe(id)
			expect(isValidCardNumber(number, { brands: [id] })).toBe(true)
		})

		it('тестовые номера эквайеров', () => {
			expect(getCardBrand('4111111111111111')?.id).toBe('visa')
			expect(getCardBrand('2223003122003222')?.id).toBe('mastercard')
			expect(getCardBrand('36227206271667')?.id).toBe('diners')
		})

		it('номер с пробелами и дефисами', () => {
			expect(getCardBrand('4242 4242-4242')?.id).toBe('visa')
		})

		it('пустой номер и неизвестный префикс — undefined', () => {
			expect(getCardBrand('')).toBeUndefined()
			expect(getCardBrand('   ')).toBeUndefined()
			expect(getCardBrand('1234')).toBeUndefined()
		})

		it('диапазон совпадает, только когда набраны все его цифры', () => {
			expect(getCardBrand('2')).toBeUndefined()
			expect(getCardBrand('22')).toBeUndefined()
			expect(getCardBrand('222')).toBeUndefined()
			expect(getCardBrand('2200')?.id).toBe('mir')
			expect(getCardBrand('2204')?.id).toBe('mir')
			expect(getCardBrand('2205')?.id).toBe('borica')
			expect(getCardBrand('2221')?.id).toBe('mastercard')
			expect(getCardBrand('2720')?.id).toBe('mastercard')
			expect(getCardBrand('2721')).toBeUndefined()
		})

		it('частично набранный номер: марка по первым цифрам', () => {
			expect(getCardBrand('4')?.id).toBe('visa')
			expect(getCardBrand('5')).toBeUndefined()
			expect(getCardBrand('50')).toBeUndefined()
			expect(getCardBrand('51')?.id).toBe('mastercard')
			expect(getCardBrand('55')?.id).toBe('mastercard')
			expect(getCardBrand('56')).toBeUndefined()
			expect(getCardBrand('3')).toBeUndefined()
			expect(getCardBrand('34')?.id).toBe('amex')
			expect(getCardBrand('35')).toBeUndefined()
			expect(getCardBrand('3528')?.id).toBe('jcb')
		})

		it('самый длинный префикс: LankaPay внутри JCB, Verve внутри Discover, Maestro 676770', () => {
			expect(getCardBrand('3571')?.id).toBe('jcb')
			expect(getCardBrand('357111')?.id).toBe('lankapay')
			expect(getCardBrand('357112')?.id).toBe('jcb')
			expect(getCardBrand('6500')?.id).toBe('discover')
			expect(getCardBrand('650002')?.id).toBe('verve')
			expect(getCardBrand('650027')?.id).toBe('verve')
			expect(getCardBrand('650028')?.id).toBe('discover')
			expect(getCardBrand('6440')?.id).toBe('discover')
			expect(getCardBrand('6011')?.id).toBe('discover')
			expect(getCardBrand('676770')?.id).toBe('maestro')
		})

		it('национальные диапазоны RuPay и Troy — только через brands', () => {
			expect(getCardBrand('6500000000000002')?.id).toBe('discover')
			expect(getCardBrand('6000000000000007')).toBeUndefined()
			expect(getCardBrand('6500000000000002', { brands: ['rupay'] })?.id).toBe('rupay')
			expect(getCardBrand('6000000000000007', { brands: ['rupay'] })?.id).toBe('rupay')
			expect(getCardBrand('6011000000000004', { brands: ['rupay'] })?.id).toBe('discover')
			expect(getCardBrand('6500020000000000', { brands: ['rupay'] })?.id).toBe('verve')
			expect(getCardBrand('6500000000000002', { brands: ['troy'] })?.id).toBe('troy')
			expect(getCardBrand('9792000000000003')?.id).toBe('troy')
			expect(getCardBrand('9792000000000003', { brands: ['visa'] })?.id).toBe('troy')
		})

		it('остальные марки таблицы распознаются и при заданном brands', () => {
			expect(getCardBrand('378282246310005', { brands: ['mir', 'visa'] })?.id).toBe('amex')
		})

		it('своя марка в brands распознаётся, с id из таблицы — заменяет марку кита', () => {
			const local = defineCardBrand({ id: 'local', name: 'Local', prefixes: ['77'] })
			expect(getCardBrand('7700')).toBeUndefined()
			expect(getCardBrand('7700', { brands: [local] })).toBe(local)

			const visa = defineCardBrand({ id: 'visa', name: 'Visa Local', prefixes: ['4'], lengths: [16] })
			expect(getCardBrand('4242', { brands: [visa] })).toBe(visa)
		})

		it('неизвестный id в brands игнорируется', () => {
			expect(getCardBrand('4242', { brands: ['nope' as CardBrandId] })?.id).toBe('visa')
		})
	})

	describe('cardDigits и cardNumberMaxLength', () => {
		it('cardDigits оставляет только цифры', () => {
			expect(cardDigits(' 4242-4242 ab42 ')).toBe('4242424242')
			expect(cardDigits('４２４２　４２４２')).toBe('42424242')
			expect(cardDigits('')).toBe('')
		})

		it('cardNumberMaxLength — наибольшая длина марки, без марки 19', () => {
			expect(cardNumberMaxLength(brand('amex'))).toBe(15)
			expect(cardNumberMaxLength(brand('visa'))).toBe(19)
			expect(cardNumberMaxLength(brand('mastercard'))).toBe(16)
			expect(cardNumberMaxLength()).toBe(19)
		})
	})

	describe('formatCardNumber', () => {
		it('группы 4 4 4 4 по марке, определённой по номеру', () => {
			expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242')
			expect(formatCardNumber('4242-4242')).toBe('4242 4242')
			expect(formatCardNumber('42424')).toBe('4242 4')
			expect(formatCardNumber('4242')).toBe('4242')
			expect(formatCardNumber('')).toBe('')
		})

		it('Amex — 4 6 5, Diners 14 цифр — 4 6 4', () => {
			expect(formatCardNumber('378282246310005')).toBe('3782 822463 10005')
			expect(formatCardNumber('30569309025904')).toBe('3056 930902 5904')
		})

		it('лишние цифры сверх длины марки отбрасываются', () => {
			expect(formatCardNumber('5555555555554444999')).toBe('5555 5555 5555 4444')
			expect(formatCardNumber('3782822463100059')).toBe('3782 822463 10005')
			expect(formatCardNumber('4242424242424242123')).toBe('4242 4242 4242 4242 123')
		})

		it('без марки — 19 цифр группами по 4', () => {
			expect(formatCardNumber('12345678901234567890123')).toBe('1234 5678 9012 3456 789')
		})

		it('явная марка сильнее определённой, явный undefined — определить самому', () => {
			expect(formatCardNumber('4242424242424242', brand('amex'))).toBe('4242 424242 42424')
			expect(formatCardNumber('378282246310005', undefined)).toBe('3782 822463 10005')
		})
	})

	describe('isLuhnValid', () => {
		it('верные и неверные суммы', () => {
			expect(isLuhnValid('4242424242424242')).toBe(true)
			expect(isLuhnValid('79927398713')).toBe(true)
			expect(isLuhnValid('4242424242424241')).toBe(false)
			expect(isLuhnValid('0')).toBe(true)
		})

		it('пустая строка и не-цифры — false', () => {
			expect(isLuhnValid('')).toBe(false)
			expect(isLuhnValid('4242 4242 4242 4242')).toBe(false)
			expect(isLuhnValid('42a2')).toBe(false)
		})
	})

	describe('isValidCardNumber', () => {
		it('тестовые номера эквайеров верны, в том числе с пробелами и дефисами', () => {
			for (const number of ['4111111111111111', '2223003122003222', '36227206271667', '378282246310005']) {
				expect(isValidCardNumber(number)).toBe(true)
			}
			expect(isValidCardNumber('4242 4242-4242 4242')).toBe(true)
		})

		it('посторонние знаки и пустая строка — false', () => {
			expect(isValidCardNumber('4242424242424242a')).toBe(false)
			expect(isValidCardNumber('4242.4242.4242.4242')).toBe(false)
			expect(isValidCardNumber('')).toBe(false)
		})

		it('длина не из допустимых у марки — false', () => {
			expect(isValidCardNumber('424242424242424')).toBe(false)
			expect(isValidCardNumber('37828224631000')).toBe(false)
			expect(isValidCardNumber('4222222222222')).toBe(true)
		})

		it('неверная сумма Луна — false; UnionPay без Луна — true', () => {
			expect(isValidCardNumber('4242424242424241')).toBe(false)
			expect(isLuhnValid('6200000000000001')).toBe(false)
			expect(isValidCardNumber('6200000000000001')).toBe(true)
		})

		it('неизвестная марка — 12–19 цифр и Луна', () => {
			expect(isValidCardNumber('100000000008')).toBe(true)
			expect(isValidCardNumber('10000000009')).toBe(false)
			expect(isValidCardNumber('100000000000000000008')).toBe(false)
			expect(isValidCardNumber('100000000007')).toBe(false)
		})

		it('национальный диапазон учитывается через brands', () => {
			expect(isValidCardNumber('6000000000000007')).toBe(true)
			expect(isValidCardNumber('6000000000000007', { brands: ['rupay'] })).toBe(true)
			expect(isValidCardNumber('60000000000000079', { brands: ['rupay'] })).toBe(false)
		})
	})

	describe('parseCardExpiry', () => {
		it.each([
			['04/30', { month: 4, year: 2030 }],
			['4/30', { month: 4, year: 2030 }],
			['04/2030', { month: 4, year: 2030 }],
			['0430', { month: 4, year: 2030 }],
			[' 12 / 26 ', { month: 12, year: 2026 }],
			['01/00', { month: 1, year: 2000 }],
		])('%s', (value, expected) => {
			expect(parseCardExpiry(value)).toEqual(expected)
		})

		it.each(['00/30', '13/30', '0030', '1330', '', '04-30', '04/3', '04/203', '043', 'ab/cd'])('%s — undefined', value => {
			expect(parseCardExpiry(value)).toBeUndefined()
		})
	})

	describe('isValidExpiry', () => {
		const now = new Date(2026, 9, 2)

		it('годна до конца указанного месяца включительно', () => {
			expect(isValidExpiry('10/26', now)).toBe(true)
			expect(isValidExpiry('10/26', new Date(2026, 9, 31, 23, 59))).toBe(true)
			expect(isValidExpiry('10/26', new Date(2026, 10, 1))).toBe(false)
			expect(isValidExpiry('09/26', now)).toBe(false)
			expect(isValidExpiry('11/26', now)).toBe(true)
			expect(isValidExpiry('01/27', now)).toBe(true)
			expect(isValidExpiry('12/25', now)).toBe(false)
		})

		it('не дальше чем через 20 лет', () => {
			expect(isValidExpiry('12/46', now)).toBe(true)
			expect(isValidExpiry('01/47', now)).toBe(false)
			expect(isValidExpiry({ month: 12, year: 2046 }, now)).toBe(true)
			expect(isValidExpiry({ month: 1, year: 2047 }, now)).toBe(false)
		})

		it('объект срока: месяц вне 1–12 или дробный — false', () => {
			expect(isValidExpiry({ month: 10, year: 2026 }, now)).toBe(true)
			expect(isValidExpiry({ month: 13, year: 2030 }, now)).toBe(false)
			expect(isValidExpiry({ month: 0, year: 2030 }, now)).toBe(false)
			expect(isValidExpiry({ month: 4.5, year: 2030 }, now)).toBe(false)
		})

		it('строка, которая не разбирается, — false', () => {
			expect(isValidExpiry('13/30', now)).toBe(false)
			expect(isValidExpiry('', now)).toBe(false)
		})

		it('без now — по текущей дате', () => {
			vi.useFakeTimers()
			vi.setSystemTime(new Date(2026, 9, 2))
			try {
				expect(isValidExpiry('10/26')).toBe(true)
				expect(isValidExpiry('09/26')).toBe(false)
			} finally {
				vi.useRealTimers()
			}
		})
	})
})
