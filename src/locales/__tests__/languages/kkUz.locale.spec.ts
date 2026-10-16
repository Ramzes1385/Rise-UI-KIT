import { kk } from '../../kk'
import { uz } from '../../uz'
import { useLocale } from '@composables/app/useLocale'
import { currentLocale, formatNumber, getLocale, LOCALES, pluralize, registerLocale, setLocale } from '../../state'

const COUNTS = [1, 2, 5, 11, 21, 22]
const DATE = new Date(Date.UTC(2025, 4, 7, 12))
const DATE_OPTIONS: Intl.DateTimeFormatOptions = { dateStyle: 'long', timeZone: 'UTC' }

beforeAll(() => {
	registerLocale(kk)
	registerLocale(uz)
})

afterEach(() => {
	setLocale('ru')
})

describe.each([
	['kk', kk],
	['uz', uz],
] as const)('язык %s', (code, locale) => {
	it('setLocale переключает язык и возвращается к русскому', () => {
		setLocale(code)
		expect(currentLocale.value).toBe(locale)
		expect(getLocale().code).toBe(code)
		expect(useLocale().locale.value).toBe(code)

		setLocale('ru')
		expect(getLocale().code).toBe('ru')
	})

	it('подключается через registerLocale, неизвестный код язык не меняет', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		setLocale(code)
		setLocale('xx' as 'ru')

		expect(useLocale().locales.value).toContain(code)
		expect(Object.keys(LOCALES)).not.toContain(code)
		expect(getLocale().code).toBe(code)
		expect(warn).toHaveBeenCalledWith(expect.stringContaining(`«xx»`))
		expect(warn.mock.calls[0][0]).toContain(Object.keys(LOCALES).join(', '))
	})

	it('множественное число по CLDR: one только у 1, остальное other', () => {
		const rules = new Intl.PluralRules(locale.intl)
		expect(COUNTS.map(count => rules.select(count))).toEqual(['one', 'other', 'other', 'other', 'other', 'other'])
		expect(rules.select(1.5)).toBe('other')
		expect(rules.select(0)).toBe('other')
	})

	it.each(COUNTS)('pluralize: %i подставляется в каждую форму словаря', count => {
		for (const forms of Object.values(locale.plural)) {
			const text = pluralize(forms, count, locale)
			expect(text).toContain(formatNumber(count, undefined, locale))
			expect(text).not.toContain('{n}')
		}
	})

	it('первый день недели — понедельник', () => {
		expect(locale.firstDayOfWeek).toBe(1)
	})
})

describe('казахский', () => {
	it('числа и даты форматируются по-казахски', () => {
		expect(formatNumber(1234.5, undefined, kk)).toBe('1 234,5')
		expect(formatNumber(0.5, { style: 'percent' }, kk)).toBe('50%')

		setLocale('kk')
		expect(useLocale().formatDate(DATE, DATE_OPTIONS)).toBe('2025 ж. 7 мамыр')
		expect(useLocale().formatDate(DATE, { weekday: 'long', timeZone: 'UTC' })).toBe('сәрсенбі')
	})

	it('формы существительных после числа', () => {
		expect(pluralize(kk.plural.PARTICIPANTS, 1, kk)).toBe('1 қатысушы')
		expect(pluralize(kk.plural.PARTICIPANTS, 22, kk)).toBe('22 қатысушы')
		expect(pluralize(kk.plural.DATES_SELECTED, 5, kk)).toBe('5 күн таңдалды')
	})

	it('строки словаря на кириллице', () => {
		expect(kk.text.CANCEL).toBe('Бас тарту')
		expect(kk.aria.CLOSE).toBe('Жабу')
		expect(kk.aria.PAGINATION_PAGE).toBe('{page}-бет')
	})
})

describe('узбекский', () => {
	it('числа и даты форматируются по-узбекски, латиницей', () => {
		expect(formatNumber(1234.5, undefined, uz)).toBe('1 234,5')
		expect(formatNumber(0.5, { style: 'percent' }, uz)).toBe('50%')

		setLocale('uz')
		expect(useLocale().formatDate(DATE, DATE_OPTIONS)).toBe('7-may, 2025')
		expect(useLocale().formatDate(DATE, { weekday: 'long', timeZone: 'UTC' })).toBe('chorshanba')
		expect(new Intl.DateTimeFormat(uz.intl).resolvedOptions().locale).toBe('uz-Latn-UZ')
	})

	it('формы существительных после числа', () => {
		expect(pluralize(uz.plural.PARTICIPANTS, 1, uz)).toBe('1 ta ishtirokchi')
		expect(pluralize(uz.plural.PARTICIPANTS, 21, uz)).toBe('21 ta ishtirokchi')
		expect(pluralize(uz.plural.DAYS, 11, uz)).toBe('11 kun')
	})

	it('апостроф: oʻ и gʻ — U+02BB, тутук белгиси — U+02BC; ни прямого, ни типографского нет', () => {
		const texts = [...Object.values(uz.plural).flatMap(forms => Object.values(forms)), ...collectTexts(uz)]
		const wrong = texts.filter(text => /[A-Za-z]['‘’`´][A-Za-z]/.test(text))
		const wrongAfterOG = texts.filter(text => /[OoGg]ʼ/.test(text))
		const wrongElsewhere = texts.filter(text => /[A-DF-FH-NP-Za-df-fh-np-z]ʻ/.test(text))

		expect(wrong).toEqual([])
		expect(wrongAfterOG).toEqual([])
		expect(wrongElsewhere).toEqual([])
		expect(uz.text.EMPTY).toBe('Maʼlumot yoʻq')
		expect(uz.text.DELETE).toBe('Oʻchirish')
	})

	it('в тексте только латиница, без кириллицы', () => {
		const withCyrillic = collectTexts(uz).filter(text => /[Ѐ-ӿ]/.test(text))

		expect(withCyrillic).toEqual([])
	})
})

function collectTexts(locale: typeof uz): string[] {
	const texts: string[] = []
	for (const [key, section] of Object.entries(locale)) {
		if (typeof section !== 'object' || key === 'plural') continue
		texts.push(...Object.values(section as Record<string, string>))
	}
	return texts
}
