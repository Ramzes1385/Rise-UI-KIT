import { warn } from '../warn'
import { setLocale } from '../state'
import { UI_WARNINGS } from '../messages'

describe('warn', () => {
	afterEach(() => setLocale('ru'))

	it('строка раздела warnings на текущем языке с префиксом кита', () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
		warn(UI_WARNINGS.NAVIGATION_UNSAFE_URL, { url: 'javascript:alert(1)' })
		setLocale('en')
		warn(UI_WARNINGS.TOAST_WITHOUT_APP)

		expect(spy.mock.calls).toEqual([
			['[rise-ui-kit] Переход по небезопасному URL заблокирован: javascript:alert(1)'],
			['[rise-ui-kit] useToast: <BaseApp> not found — the notification was not shown. Wrap the app in <BaseApp>.'],
		])
		spy.mockRestore()
	})

	it('неизвестный язык: предупреждение на текущем языке', () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
		setLocale('en')
		setLocale('de' as 'ru')

		expect(spy).toHaveBeenCalledWith('[rise-ui-kit] Unknown locale "de". Available: ru, en, kk, uz; add your own with registerLocale()')
		spy.mockRestore()
	})
})
