import { en } from '../../en'
import { kk } from '../../kk'
import { ru } from '../../ru'
import { LOCALES } from '../..'
import { DEFAULT_LOCALE } from '../../current'
import { useLocale } from '@composables/app/useLocale'
import type { UiKitLocale } from '../../types/locales.types'
import { UI_PLURAL, UI_TEXT, UI_WARNINGS } from '../../messages'
import { currentLocale, getLocale, pluralize, registerLocale, registerLocaleOnce, setLocale } from '../../state'

type StateModule = typeof import('../../state')

/** Состояние языка без `registerLocale(en)` из setup-vitest: как в приложении без плагина */
async function freshState(): Promise<StateModule> {
	vi.resetModules()
	return import('../../state')
}

afterEach(() => {
	registerLocale(en)
	setLocale('ru')
	vi.restoreAllMocks()
})

describe('русский по умолчанию', () => {
	it('текущий язык — код, тег Intl и первый день недели без строк; строки — из разделов ru', () => {
		expect(getLocale()).toBe(DEFAULT_LOCALE)
		expect(DEFAULT_LOCALE).toEqual({ code: 'ru', intl: 'ru-RU', firstDayOfWeek: 1 })
		expect(UI_TEXT.EMPTY).toBe(ru.text.EMPTY)
		expect(pluralize(UI_PLURAL.PARTICIPANTS, 3)).toBe('3 участника')
	})

	it('setLocale("ru") возвращает русский по умолчанию, а не словарь целиком', () => {
		setLocale('en')
		setLocale('ru')

		expect(currentLocale.value).toBe(DEFAULT_LOCALE)
		expect(UI_TEXT.EMPTY).toBe('Нет данных')
	})

	it('разделы следуют за языком: en, затем свой словарь без части разделов — недостающие из ru', () => {
		setLocale('en')
		expect(UI_TEXT.EMPTY).toBe(en.text.EMPTY)
		expect(UI_PLURAL.PARTICIPANTS).toEqual(en.plural.PARTICIPANTS)

		setLocale({ code: 'xx', intl: 'en-US', firstDayOfWeek: 0, text: { ...ru.text, EMPTY: 'Пусто' } } as unknown as UiKitLocale)
		expect(UI_TEXT.EMPTY).toBe('Пусто')
		expect(UI_PLURAL.PARTICIPANTS).toEqual(ru.plural.PARTICIPANTS)
	})

	it('useLocale().messages — словарь целиком: ru по умолчанию, иначе текущий', () => {
		const { messages } = useLocale()
		expect(messages.value).toBe(ru)

		setLocale('en')
		expect(messages.value).toBe(en)
	})

	it('LOCALES (устарел) — готовые словари ru и en', () => {
		expect(LOCALES).toEqual({ ru, en })
	})
})

describe('готовые словари подключаются через registerLocale', () => {
	it('без регистрации доступен только ru; en и kk — предупреждение с подсказкой, как подключить', async () => {
		const state = await freshState()
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

		expect(state.localeCodes.value).toEqual(['ru'])
		state.setLocale('en')
		state.setLocale('kk')

		expect(state.getLocale().code).toBe('ru')
		expect(warn.mock.calls.map(([message]) => message)).toEqual([
			"[rise-ui-kit] Язык «en» не подключён: импортируйте словарь и зарегистрируйте его один раз при старте — import { en, registerLocale } from '@ramzes1385/rise-ui-kit'; registerLocale(en). Доступные: ru",
			"[rise-ui-kit] Язык «kk» не подключён: импортируйте словарь и зарегистрируйте его один раз при старте — import { kk, registerLocale } from '@ramzes1385/rise-ui-kit'; registerLocale(kk). Доступные: ru",
		])
	})

	it('после регистрации код принимается; свой неизвестный код — прежнее предупреждение', async () => {
		const state = await freshState()
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

		state.registerLocale(kk)
		state.setLocale('kk')
		state.setLocale('fr')

		expect(state.getLocale()).toBe(kk)
		expect(warn).toHaveBeenCalledTimes(1)
		expect(warn.mock.calls[0][0]).toContain('«fr»')
		expect(warn.mock.calls[0][0]).toContain('ru, kk')
	})

	it('предупреждение о неподключённом словаре — на текущем языке', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		setLocale('en')
		setLocale('ja')

		expect(warn).toHaveBeenCalledWith(expect.stringContaining('Locale "ja" is not registered'))
		expect(UI_WARNINGS.UNREGISTERED_LOCALE).toBe(en.warnings.UNREGISTERED_LOCALE)
	})
})

describe('registerLocaleOnce', () => {
	it('регистрирует код, которого ещё нет', async () => {
		const state = await freshState()
		state.registerLocaleOnce(en)

		expect(state.localeCodes.value).toEqual(['ru', 'en'])
	})

	it('не заменяет словарь, который приложение уже зарегистрировало', () => {
		const custom = { ...en, text: { ...en.text, EMPTY: 'Nothing yet' } }
		registerLocale(custom)
		registerLocaleOnce(en)
		setLocale('en')

		expect(getLocale()).toBe(custom)
		expect(UI_TEXT.EMPTY).toBe('Nothing yet')
	})
})
