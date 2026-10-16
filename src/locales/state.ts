import { en } from './en'
import { ja } from './ja'
import { kk } from './kk'
import { ru } from './ru'
import { uz } from './uz'
import { zh } from './zh'
/** Текущий язык кита: один на страницу. Его задают `createUiKitPlugin({ locale })`, `<BaseApp locale>` и `setLocale()` */
import { computed, shallowRef } from 'vue'
import type { LocaleInput, LocaleOverrides, UiKitLocale } from './types/locales.types'

export const LOCALES = { ru: ru as UiKitLocale, en, kk, uz, zh, ja } as const

/** Текущий язык: shallowRef — компоненты перерисовываются при смене языка */
export const currentLocale = shallowRef<UiKitLocale>(LOCALES.ru)

/** Языки, зарегистрированные приложением через `registerLocale()`: по коду; shallowRef — список кодов реактивен */
const registered = shallowRef<ReadonlyMap<string, UiKitLocale>>(new Map())

/**
 * Регистрирует язык приложения по `locale.code`: после этого его принимают `setLocale('xx')`, `<BaseApp locale="xx">`
 * и `createUiKitPlugin({ locale: 'xx' })`. Повторная регистрация того же кода (в том числе встроенного `ru`, `en`)
 * заменяет прежний словарь; если этот язык сейчас включён, строки обновляются сразу.
 *
 * @example
 * registerLocale(defineLocale(en, { code: 'de', intl: 'de-DE', firstDayOfWeek: 1, text: { EMPTY: 'Leer' } }))
 * setLocale('de')
 */
export function registerLocale(locale: UiKitLocale): void {
	registered.value = new Map(registered.value).set(locale.code, locale)
	if (currentLocale.value.code === locale.code) currentLocale.value = locale
}

/** Коды доступных языков: встроенные и зарегистрированные; реактивный список для переключателя языка */
export const localeCodes = computed(() => [...new Set([...Object.keys(LOCALES), ...registered.value.keys()])])

/** Меняет язык кита: код встроенного или зарегистрированного (`registerLocale`) языка либо словарь. Неизвестный код оставляет текущий язык и пишет предупреждение */
export function setLocale(locale: LocaleInput): void {
	if (typeof locale !== 'string') {
		currentLocale.value = locale
		return
	}
	const known =
		registered.value.get(locale) ??
		(Object.keys(LOCALES).includes(locale) ? (LOCALES as Record<string, UiKitLocale>)[locale] : undefined)
	if (known) currentLocale.value = known
	else {
		const message = formatMessage(currentLocale.value.warnings.UNKNOWN_LOCALE, { locale, locales: localeCodes.value.join(', ') })
		console.warn(`[rise-ui-kit] ${message}`)
	}
}

export function getLocale(): UiKitLocale {
	return currentLocale.value
}

/**
 * Свой язык поверх готового словаря: заменяет только переданные строки.
 *
 * @example
 * const enGB = defineLocale(en, { code: 'en-GB', intl: 'en-GB', firstDayOfWeek: 1 })
 * const custom = defineLocale(ru, { text: { EMPTY: 'Пока пусто' } })
 */
export function defineLocale(base: UiKitLocale, overrides: LocaleOverrides): UiKitLocale {
	const result: Record<string, unknown> = { ...base }
	for (const [key, value] of Object.entries(overrides)) {
		const baseValue = (base as unknown as Record<string, unknown>)[key]
		result[key] = value !== null && typeof value === 'object' ? { ...(baseValue as object), ...value } : value
	}
	return result as unknown as UiKitLocale
}

/** Число в формате текущего языка: `1,5` по-русски, `1.5` по-английски */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions, locale: UiKitLocale = currentLocale.value): string {
	return new Intl.NumberFormat(locale.intl, options).format(value)
}

/** Подставляет значения в строку словаря: `{name}` → params.name. Неизвестные места остаются как есть */
export function formatMessage(template: string, params: Record<string, string | number>): string {
	return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in params ? String(params[key]) : match))
}

/** Строка для числа по правилам языка: 1 участник, 3 участника, 5 участников. `{n}` — число в формате языка */
export function pluralize(
	forms: { readonly other: string } & Partial<Record<Intl.LDMLPluralRule, string>>,
	count: number,
	locale: UiKitLocale = currentLocale.value,
): string {
	const category = new Intl.PluralRules(locale.intl).select(count)
	return formatMessage(forms[category] ?? forms.other, { n: formatNumber(count, undefined, locale) })
}
