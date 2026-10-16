import { en } from '@/locales/en'
import { useLocale } from '../useLocale'
import { defineLocale, registerLocale, setLocale } from '@/locales/state'

afterEach(() => {
	setLocale('ru')
})

describe('useLocale', () => {
	it('код, словарь и смена языка', () => {
		const { locale, messages, setLocale: change } = useLocale()
		expect(locale.value).toBe('ru')
		expect(messages.value.aria.CLOSE).toBe('Закрыть')

		change('en')
		expect(locale.value).toBe('en')
		expect(messages.value.aria.CLOSE).toBe('Close')
	})

	it('числа, даты, множественное число и подстановка по правилам текущего языка', () => {
		const { formatNumber, formatDate, plural, formatMessage } = useLocale()
		const date = new Date(2025, 4, 15)

		expect(formatNumber(1234.5)).toBe('1\u00a0234,5')
		expect(formatDate(date, { month: 'long' })).toBe('май')
		expect(plural({ one: '{n} файл', few: '{n} файла', many: '{n} файлов', other: '{n} файла' }, 5)).toBe('5 файлов')
		expect(formatMessage('{a}+{b}', { a: 1, b: 2 })).toBe('1+2')

		setLocale('en')
		expect(formatNumber(1234.5)).toBe('1,234.5')
		expect(formatDate(date, { month: 'long' })).toBe('May')
		expect(plural({ one: '{n} file', other: '{n} files' }, 1)).toBe('1 file')
	})

	it('locales — коды доступных языков, включая зарегистрированные', () => {
		const { locales, locale, setLocale: change } = useLocale()
		expect(locales.value).toEqual(expect.arrayContaining(['ru', 'en']))

		registerLocale(defineLocale(en, { code: 'tt', intl: 'tt-RU' }))
		expect(locales.value).toContain('tt')

		change('tt')
		expect(locale.value).toBe('tt')
	})
})
