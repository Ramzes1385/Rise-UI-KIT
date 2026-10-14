import { en } from '../en'
import { ru } from '../ru'
import type { UiKitLocale } from '../types/locales.types'
import { currentLocale, defineLocale, formatMessage, formatNumber, getLocale, LOCALES, pluralize, setLocale } from '../state'

const SECTIONS = Object.keys(ru).filter(key => !['code', 'intl', 'firstDayOfWeek'].includes(key)) as (keyof typeof ru & keyof UiKitLocale)[]

describe('словари', () => {
	it.each(SECTIONS)('в английском разделе %s те же ключи, что в русском', section => {
		expect(Object.keys(en[section]).sort()).toEqual(Object.keys(ru[section]).sort())
	})

	it('места для значений {name} в переводе те же, что в оригинале', () => {
		const placeholders = (value: string) => [...value.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort()
		for (const section of SECTIONS.filter(name => name !== 'plural')) {
			for (const [key, value] of Object.entries(ru[section])) {
				expect([section, key, placeholders((en[section] as Record<string, string>)[key])]).toEqual([
					section,
					key,
					placeholders(value),
				])
			}
		}
	})

	it('встроенные языки и первый день недели', () => {
		expect(LOCALES.ru.intl).toBe('ru-RU')
		expect(LOCALES.en.intl).toBe('en-US')
		expect([ru.firstDayOfWeek, en.firstDayOfWeek]).toEqual([1, 0])
	})
})

describe('setLocale', () => {
	afterEach(() => {
		setLocale('ru')
	})

	it('по умолчанию русский; меняется кодом или словарём', () => {
		expect(getLocale().code).toBe('ru')

		setLocale('en')
		expect(currentLocale.value).toBe(en)

		const custom = defineLocale(en, { code: 'en-GB', intl: 'en-GB', firstDayOfWeek: 1 })
		setLocale(custom)
		expect(getLocale()).toBe(custom)
	})

	it('неизвестный код оставляет язык и предупреждает', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		setLocale('de' as 'ru')

		expect(getLocale().code).toBe('ru')
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('Неизвестный язык «de»'))
	})
})

describe('defineLocale', () => {
	it('заменяет только переданные строки и поля', () => {
		const custom: UiKitLocale = defineLocale(ru, { text: { EMPTY: 'Пока пусто' }, plural: { PARTICIPANTS: { other: '{n} чел.' } } })

		expect(custom.text.EMPTY).toBe('Пока пусто')
		expect(custom.text.CANCEL).toBe(ru.text.CANCEL)
		expect(custom.aria).toBe(ru.aria)
		expect(custom.plural.PARTICIPANTS).toEqual({ other: '{n} чел.' })
		expect(custom.plural.DATES_SELECTED).toBe(ru.plural.DATES_SELECTED)
		expect(custom.code).toBe('ru')
	})
})

describe('formatMessage', () => {
	it('подставляет значения, неизвестные места оставляет', () => {
		expect(formatMessage('Слайд {current} из {total}', { current: 2, total: 6 })).toBe('Слайд 2 из 6')
		expect(formatMessage('{from}–{to} из {total}', { from: 1, to: 10 })).toBe('1–10 из {total}')
	})
})

describe('pluralize и formatNumber', () => {
	it.each([
		[1, '1 участник'],
		[3, '3 участника'],
		[5, '5 участников'],
		[21, '21 участник'],
		[1.5, '1,5 участника'],
	])('русский: %s → %s', (count, expected) => {
		expect(pluralize(ru.plural.PARTICIPANTS, count, ru as UiKitLocale)).toBe(expected)
	})

	it('английский и формы, которых нет в словаре, — через other', () => {
		expect(pluralize(en.plural.PARTICIPANTS, 1, en)).toBe('1 member')
		expect(pluralize(en.plural.PARTICIPANTS, 3, en)).toBe('3 members')
		expect(pluralize({ other: '{n} шт.' }, 3)).toBe('3 шт.')
	})

	it.each([
		[1, 'Выбрана 1 скрытая строка — она остаётся в выборе'],
		[2, 'Выбраны 2 скрытые строки — они остаются в выборе'],
		[5, 'Выбрано 5 скрытых строк — они остаются в выборе'],
		[21, 'Выбрана 21 скрытая строка — она остаётся в выборе'],
	])('строки таблицы, скрытые поиском: %i согласуется с глаголом', (count, expected) => {
		expect(pluralize(ru.plural.TABLE_HIDDEN_SELECTED, count, ru as UiKitLocale)).toBe(expected)
	})

	it('английский текст про скрытые строки называет и поиск', () => {
		expect(pluralize(en.plural.TABLE_HIDDEN_SELECTED, 2, en)).toBe(
			'2 selected rows are hidden by the search or filters and stay selected',
		)
	})

	it('числа в формате языка', () => {
		expect(formatNumber(1234.5)).toBe('1\u00a0234,5')
		expect(formatNumber(1234.5, undefined, en)).toBe('1,234.5')
		expect(formatNumber(0.5, { style: 'percent' }, en)).toBe('50%')
	})
})
