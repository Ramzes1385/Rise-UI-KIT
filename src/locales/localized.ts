/** Раздел словаря текущего языка как объект строк, напр. `localized('aria').CLOSE`; читается через shallowRef, поэтому шаблоны и computed обновляются при смене языка (`setLocale`). */
import { currentLocale } from './state'
import type { LocaleSection, UiKitLocale } from './types/locales.types'

export function localized<K extends LocaleSection>(section: K): Readonly<UiKitLocale[K]> {
	const messages = (): Record<string, string> => currentLocale.value[section] as Record<string, string>
	return new Proxy(
		{},
		{
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
				if (typeof key === 'string' && key in messages())
					return { value: messages()[key], enumerable: true, configurable: true, writable: false }
				return Reflect.getOwnPropertyDescriptor(target, key)
			},
		},
	) as Readonly<UiKitLocale[K]>
}
