/**
 * Строки интерфейса на текущем языке. `UI_TEXT`, `UI_ARIA` и другие константы с текстом — не объекты со строками,
 * а представления раздела словаря: `UI_ARIA.CLOSE` возвращает строку текущего языка. Чтение идёт через shallowRef,
 * поэтому шаблоны и computed перерисовываются при смене языка (`setLocale`).
 */
import { currentLocale } from '@/locales/state'
import type { LocaleSection, UiKitLocale } from '@/locales/types'

export function localized<K extends LocaleSection, E extends Record<string, unknown> = Record<never, never>>(
	section: K,
	extra: E = {} as E,
): Readonly<UiKitLocale[K]> & Readonly<E> {
	const messages = (): Record<string, string> => currentLocale.value[section] as Record<string, string>
	return new Proxy(extra, {
		get(target, key) {
			if (typeof key === 'string' && key in messages()) return messages()[key]
			return Reflect.get(target, key)
		},
		has(target, key) {
			return (typeof key === 'string' && key in messages()) || Reflect.has(target, key)
		},
		ownKeys(target) {
			return [...new Set([...Object.keys(messages()), ...Reflect.ownKeys(target)])]
		},
		getOwnPropertyDescriptor(target, key) {
			if (typeof key === 'string' && key in messages()) return { value: messages()[key], enumerable: true, configurable: true, writable: false }
			return Reflect.getOwnPropertyDescriptor(target, key)
		},
	}) as Readonly<UiKitLocale[K]> & Readonly<E>
}
