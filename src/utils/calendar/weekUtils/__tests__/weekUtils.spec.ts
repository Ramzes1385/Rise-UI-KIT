import { en } from '@/locales/en'
import { resolveFirstDayOfWeek } from '../weekUtils'
import { defineLocale, setLocale } from '@/locales/state'

function stubIntlLocale(factory: () => object): void {
	vi.spyOn(Intl, 'Locale').mockImplementation(function () {
		return factory()
	} as unknown as typeof Intl.Locale)
}

describe('resolveFirstDayOfWeek', () => {
	afterEach(() => {
		vi.restoreAllMocks()
		setLocale('ru')
	})

	it('без locale и с locale языка кита — firstDayOfWeek кита', () => {
		setLocale('ru')
		expect(resolveFirstDayOfWeek()).toBe(1)
		expect(resolveFirstDayOfWeek(undefined)).toBe(1)
		expect(resolveFirstDayOfWeek(null)).toBe(1)
		expect(resolveFirstDayOfWeek('ru-RU')).toBe(1)

		setLocale('en')
		expect(resolveFirstDayOfWeek('en-US')).toBe(0)
	})

	it('locale, равный intl языка кита с переопределённым первым днём, не перечитывается из Intl', () => {
		setLocale(defineLocale(en, { code: 'en-custom', intl: 'en-US', firstDayOfWeek: 3 }))

		expect(resolveFirstDayOfWeek('en-US')).toBe(3)
	})

	it('явный locale другого языка — первый день недели этого языка из Intl.Locale', () => {
		setLocale('ru')
		expect(resolveFirstDayOfWeek('en-US')).toBe(0)
		expect(resolveFirstDayOfWeek('en-GB')).toBe(1)
		expect(resolveFirstDayOfWeek('de-DE')).toBe(1)
		expect(resolveFirstDayOfWeek('ja-JP')).toBe(0)

		setLocale('en')
		expect(resolveFirstDayOfWeek('ru')).toBe(1)
		expect(resolveFirstDayOfWeek('ar-SA')).toBe(0)
		expect(resolveFirstDayOfWeek('ar-EG')).toBe(6)
	})

	it('getWeekInfo() старше свойства weekInfo; воскресенье (7) становится 0', () => {
		setLocale('ru')
		stubIntlLocale(() => ({ getWeekInfo: () => ({ firstDay: 7 }), weekInfo: { firstDay: 2 } }))
		expect(resolveFirstDayOfWeek('xx-XX')).toBe(0)
	})

	it('без getWeekInfo читается свойство weekInfo', () => {
		setLocale('ru')
		stubIntlLocale(() => ({ weekInfo: { firstDay: 6 } }))
		expect(resolveFirstDayOfWeek('xx-XX')).toBe(6)
	})

	it.each([
		['нет ни метода, ни свойства', {}],
		['пустые сведения', { weekInfo: {} }],
		['firstDay не число', { weekInfo: { firstDay: 'mon' } }],
		['firstDay вне 1…7', { weekInfo: { firstDay: 0 } }],
		['firstDay больше 7', { getWeekInfo: () => ({ firstDay: 8 }) }],
	])('%s — запасной вариант: firstDayOfWeek кита', (_name, shape) => {
		setLocale('en')
		stubIntlLocale(() => shape)
		expect(resolveFirstDayOfWeek('xx-XX')).toBe(0)

		setLocale('ru')
		expect(resolveFirstDayOfWeek('xx-XX')).toBe(1)
	})

	it('неразбираемый язык: Intl.Locale бросает — запасной вариант кита', () => {
		setLocale('ru')
		expect(resolveFirstDayOfWeek('не язык!')).toBe(1)
	})
})
