import { en } from '../en'
import { ru } from '../ru'
import { UI_ARIA, UI_TEXT } from '../messages'
import type { UiKitLocale } from '../types/locales.types'
import { defineLocale, formatNumber, getLocale, localeCodes, registerLocale, setLocale } from '../state'

const de: UiKitLocale = defineLocale(en, {
	code: 'de',
	intl: 'de-DE',
	firstDayOfWeek: 1,
	text: { EMPTY: 'Leer' },
	aria: { CLOSE: 'Schließen' },
})

describe('registerLocale', () => {
	afterEach(() => {
		registerLocale(en)
		setLocale('ru')
		vi.restoreAllMocks()
	})

	it('зарегистрированный код принимает setLocale: строки, формат чисел и первый день недели — из словаря', () => {
		registerLocale(de)
		setLocale('de')

		expect(getLocale()).toBe(de)
		expect(UI_TEXT.EMPTY).toBe('Leer')
		expect(UI_ARIA.CLOSE).toBe('Schließen')
		expect(UI_TEXT.CANCEL).toBe(en.text.CANCEL)
		expect(formatNumber(1234.5)).toBe('1.234,5')
		expect(getLocale().firstDayOfWeek).toBe(1)
	})

	it('без регистрации код неизвестен: язык не меняется, предупреждение называет доступные коды', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		setLocale('fr')

		expect(getLocale().code).toBe('ru')
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('Неизвестный язык «fr»'))
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('registerLocale()'))

		registerLocale(de)
		setLocale('fr')
		expect(warn).toHaveBeenLastCalledWith(expect.stringContaining('ru, en'))
		expect(warn).toHaveBeenLastCalledWith(expect.stringContaining('de'))
	})

	it('имена вроде constructor и __proto__ — не языки', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		setLocale('constructor')
		setLocale('__proto__')

		expect(getLocale().code).toBe('ru')
		expect(warn).toHaveBeenCalledTimes(2)
	})

	it('повторная регистрация заменяет словарь; включённый язык обновляется сразу', () => {
		registerLocale(de)
		setLocale('de')
		const next = defineLocale(de, { text: { EMPTY: 'Nichts' } })

		registerLocale(next)
		expect(getLocale()).toBe(next)
		expect(UI_TEXT.EMPTY).toBe('Nichts')

		setLocale('ru')
		registerLocale(defineLocale(de, { text: { EMPTY: 'Keine Daten' } }))
		expect(getLocale().code).toBe('ru')
		setLocale('de')
		expect(UI_TEXT.EMPTY).toBe('Keine Daten')
	})

	it('своя версия встроенного языка заменяет его для setLocale по коду', () => {
		const custom = defineLocale(ru, { text: { EMPTY: 'Пока пусто' } })
		registerLocale(custom)
		setLocale('en')
		setLocale('ru')

		expect(getLocale()).toBe(custom)
		expect(UI_TEXT.EMPTY).toBe('Пока пусто')
		registerLocale(ru)
	})

	it('localeCodes — встроенные и зарегистрированные коды без повторов, реактивно', () => {
		const before = localeCodes.value
		expect(before).toEqual(expect.arrayContaining(['ru', 'en']))

		registerLocale({ ...de, code: 'de-AT' })
		registerLocale({ ...de, code: 'de-AT' })
		expect(localeCodes.value).toEqual([...before, 'de-AT'])
		expect(localeCodes.value.filter(code => code === 'de-AT')).toHaveLength(1)
	})
})
