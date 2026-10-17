/** Раздел словаря текущего языка как объект строк, напр. `localized('aria', ruAria).CLOSE`: нет раздела у языка (русский по умолчанию) — строки `fallback`. */
import { currentLocale } from './current'
import { legacyMessage } from './legacyKeys'
import type { LocaleSection, MessageMap, UiKitLocale } from './types/locales.types'

/** Читается через shallowRef: шаблоны и computed обновляются при смене языка (`setLocale`) */
export function localized<K extends LocaleSection | 'plural'>(section: K, fallback: UiKitLocale[K]): Readonly<UiKitLocale[K]> {
	const messages = (): MessageMap => (currentLocale.value[section] ?? fallback) as unknown as MessageMap
	return new Proxy(
		{},
		{
			get(target, key) {
				if (typeof key === 'string') {
					const legacy = legacyMessage(section, key, messages())
					if (legacy !== undefined) return legacy
					if (key in messages()) return messages()[key]
				}
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
					return {
						value: legacyMessage(section, key, messages()) ?? messages()[key],
						enumerable: true,
						configurable: true,
						writable: false,
					}
				return Reflect.getOwnPropertyDescriptor(target, key)
			},
		},
	) as Readonly<UiKitLocale[K]>
}
