import { en } from '@/locales/en'
import { ru } from '@/locales/ru'
import { caretAfter, cleanMoney, countMeaningful, draftText, formatMoney, moneyFormat, parseMoney } from '../../model/money/moneyFormat'

const RUB = moneyFormat(ru, { currency: 'RUB', min: 0 })

const USD = moneyFormat(en, { currency: 'USD', min: -100 })

describe('формат суммы', () => {
	it('разделители, знак валюты и знаки после запятой по языку и валюте', () => {
		expect(RUB).toMatchObject({ decimal: ',', symbol: '₽', isSymbolFirst: false, fraction: 2, isNegativeAllowed: false })
		expect(RUB.group).toMatch(/\s/)
		expect(USD).toMatchObject({ group: ',', decimal: '.', symbol: '$', isSymbolFirst: true, isNegativeAllowed: true })
		expect(moneyFormat(ru, { currency: 'JPY', min: 0 }).fraction).toBe(0)
	})

	it('cleanMoney: цифры, один разделитель, копейки, минус и разряды другого языка', () => {
		expect(cleanMoney('1 234,567', RUB)).toBe('1234.56')
		expect(cleanMoney('１２３４．５６７', RUB)).toBe('1234.56')
		expect(cleanMoney('00012.5.1', RUB)).toBe('12.51')
		expect(cleanMoney('-5 руб', RUB)).toBe('5')
		expect(cleanMoney('-1,234.5', USD)).toBe('-1234.5')
		expect(cleanMoney('12,5', moneyFormat(ru, { currency: 'JPY', min: 0 }))).toBe('12')
		expect(cleanMoney('', RUB)).toBe('')
	})

	it('draftText, parseMoney, formatMoney и место курсора', () => {
		expect(draftText('1234567.5', RUB)).toBe(`1${RUB.group}234${RUB.group}567,5`)
		expect(draftText('-1234', USD)).toBe('-1,234')
		expect(draftText('12.', USD)).toBe('12.')
		expect(parseMoney('12.5')).toBe(12.5)
		expect(parseMoney('-')).toBeNull()
		expect(formatMoney(null, RUB)).toBe('')
		expect(formatMoney(1234, USD)).toBe('1,234')
		expect(formatMoney(1234.5, USD)).toBe('1,234.50')
		expect(caretAfter('1,234', 2, USD)).toBe(3)
		expect(caretAfter('12', 5, USD)).toBe(2)
		expect(countMeaningful('1,234.5', USD)).toBe(6)
		expect(countMeaningful('1,5', RUB)).toBe(3)
	})
})
