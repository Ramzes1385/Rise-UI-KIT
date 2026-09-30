import { en } from './en'
import { ru } from './ru'
/** Текущий язык кита: один на страницу. Его задают `createUiKitPlugin({ locale })`, `<BaseApp locale>` и `setLocale()` */
import { shallowRef } from 'vue'
import type { LocaleInput, LocaleOverrides, UiKitLocale } from './types/locales.types'

export const LOCALES = { ru: ru as UiKitLocale, en } as const

/** Текущий язык: shallowRef — компоненты перерисовываются при смене языка */
export const currentLocale = shallowRef<UiKitLocale>(LOCALES.ru)

/** Меняет язык кита. Неизвестный код оставляет текущий язык и пишет предупреждение */
export function setLocale(locale: LocaleInput): void {
	if (typeof locale !== 'string') {
		currentLocale.value = locale
		return
	}
	const builtIn = LOCALES[locale]
	if (builtIn) currentLocale.value = builtIn
	else {
		const message = formatMessage(currentLocale.value.warnings.UNKNOWN_LOCALE, { locale, locales: Object.keys(LOCALES).join(', ') })
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
