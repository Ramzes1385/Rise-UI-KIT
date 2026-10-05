import {
	isValidAccount,
	isValidBik,
	isValidCorrespondentAccount,
	isValidInn,
	isValidKpp,
	isValidOgrn,
	isValidSnils,
} from '../requisiteUtils'

describe('проверка реквизитов', () => {
	it('ИНН организации и человека', () => {
		expect(isValidInn('7707083893')).toBe(true)
		expect(isValidInn('7707083894')).toBe(false)
		expect(isValidInn('500100732259')).toBe(true)
		expect(isValidInn('500100732258')).toBe(false)
		expect(isValidInn('500100732249')).toBe(false)
		expect(isValidInn('77070838')).toBe(false)
	})

	it('КПП, БИК, ОГРН и ОГРНИП', () => {
		expect(isValidKpp('773601001')).toBe(true)
		expect(isValidKpp('7736AB001')).toBe(true)
		expect(isValidKpp('7736ab001')).toBe(false)
		expect(isValidBik('044525225')).toBe(true)
		expect(isValidBik('144525225')).toBe(false)
		expect(isValidOgrn('1027700132195')).toBe(true)
		expect(isValidOgrn('1027700132194')).toBe(false)
		expect(isValidOgrn('304500116000157')).toBe(true)
		expect(isValidOgrn('12345')).toBe(false)
	})

	it('расчётный и корреспондентский счёт вместе с БИК', () => {
		expect(isValidAccount('40702810938000000001', '044525225')).toBe(true)
		expect(isValidAccount('40702810400000000001', '044525225')).toBe(false)
		expect(isValidAccount('40702810938000000001', '')).toBe(false)
		expect(isValidAccount('4070281093800000000', '044525225')).toBe(false)
		expect(isValidCorrespondentAccount('30101810400000000225', '044525225')).toBe(true)
		expect(isValidCorrespondentAccount('30101810400000000226', '044525225')).toBe(false)
	})

	it('СНИЛС: контрольное число, суммы 100 и 101, ранние номера без проверки', () => {
		expect(isValidSnils('112-233-445 95')).toBe(true)
		expect(isValidSnils('11223344596')).toBe(false)
		expect(isValidSnils('00132667900')).toBe(true)
		expect(isValidSnils('00150881600')).toBe(true)
		expect(isValidSnils('00289464149')).toBe(true)
		expect(isValidSnils('00100199812')).toBe(true)
		expect(isValidSnils('1122334459')).toBe(false)
	})
})
