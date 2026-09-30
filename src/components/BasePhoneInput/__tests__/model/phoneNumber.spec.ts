import { PHONE_COUNTRIES } from '../../model/phone/phoneCountries'
import { maskPlaceholder, maskSize, onlyDigits, parsePhone, pastedPhone, regionName } from '../../model/phone/phoneNumber'

const country = (code: string) => PHONE_COUNTRIES.find(item => item.code === code) as (typeof PHONE_COUNTRIES)[number]

describe('номер телефона', () => {
	it('маска: число цифр и подсказка', () => {
		expect(maskSize('(###) ###-##-##')).toBe(10)
		expect(maskPlaceholder('(###) ###-##-##')).toBe('(000) 000-00-00')
		expect(onlyDigits('+7 (916) 123')).toBe('7916123')
	})

	it('parsePhone: пусто, предпочтительная страна, самый длинный код, неизвестный код', () => {
		expect(parsePhone('', PHONE_COUNTRIES)).toEqual({ country: undefined, digits: '' })
		expect(parsePhone('+77012345678', PHONE_COUNTRIES, 'KZ')).toEqual({ country: country('KZ'), digits: '7012345678' })
		expect(parsePhone('+79161234567', PHONE_COUNTRIES)).toEqual({ country: country('RU'), digits: '9161234567' })
		expect(parsePhone('+375291234567', PHONE_COUNTRIES, 'RU')).toEqual({ country: country('BY'), digits: '291234567' })
		expect(parsePhone('+2345', PHONE_COUNTRIES)).toEqual({ country: undefined, digits: '2345' })
	})

	it('pastedPhone: плюс, восьмёрка, код страны без плюса; короткий номер — вставка как есть', () => {
		const context = { countries: PHONE_COUNTRIES, current: country('RU') }
		expect(pastedPhone('+375 29 123-45-67', context)).toEqual({ country: country('BY'), digits: '291234567' })
		expect(pastedPhone('+7 916 123-45-67 доб. 12', context)).toEqual({ country: country('RU'), digits: '9161234567' })
		expect(pastedPhone('8 (916) 123-45-67', context)).toEqual({ country: country('RU'), digits: '9161234567' })
		expect(pastedPhone('7 916 123 45 67', context)).toEqual({ country: country('RU'), digits: '9161234567' })
		expect(pastedPhone('916 123-45-67', context)).toBeNull()
		expect(pastedPhone('+2 345', context)).toBeNull()
		expect(pastedPhone('80291234567', { countries: PHONE_COUNTRIES, current: country('BY') })).toBeNull()
	})

	it('название страны на языке кита', () => {
		expect(regionName('KZ')).toBe('Казахстан')
	})
})
