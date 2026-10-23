import { localized } from './localized'
/** Язык кита: регистрация словарей, смена языка, подстановки и множественное число; язык задают `createUiKitPlugin({ locale })`, `<BaseApp locale>` и `setLocale()` */
import { computed, shallowRef } from 'vue'
import { KIT_LOCALE_CODES } from './types/locales.types'
import { currentLocale, DEFAULT_LOCALE } from './current'
import { ruLocaleWarnings } from './ru/rules/localeWarnings'
import type { ActiveLocale, LocaleCore, LocaleInput, LocaleOverrides, UiKitLocale } from './types/locales.types'

export { currentLocale } from './current'

/** Языки, зарегистрированные через `registerLocale()`: по коду; shallowRef — список кодов реактивен */
const registered = shallowRef<ReadonlyMap<string, UiKitLocale>>(new Map())

/**
 * Регистрирует язык по `locale.code`: после этого его принимают `setLocale('xx')`, `<BaseApp locale="xx">`
 * и `createUiKitPlugin({ locale: 'xx' })`. Встроен только `ru`; готовые `en`, `kk`, `uz`, `zh`, `ja` и свои языки подключаются
 * так, и в сборку приложения попадают только подключённые словари (`createUiKitPlugin` подключает `en` сам).
 * Повторная регистрация того же кода (в том числе `ru`) заменяет прежний словарь; если этот язык сейчас включён, строки обновляются сразу.
 *
 * @example
 * registerLocale(en)
 * registerLocale(defineLocale(en, { code: 'de', intl: 'de-DE', firstDayOfWeek: 1, text: { EMPTY: 'Leer' } }))
 * setLocale('de')
 */
export function registerLocale(locale: UiKitLocale): void {
	registered.value = new Map(registered.value).set(locale.code, locale)
	if (currentLocale.value.code === locale.code) currentLocale.value = locale
}

/** Регистрирует язык, только если его код ещё не зарегистрирован: так `createUiKitPlugin` подключает `en`, не затирая словарь приложения */
export function registerLocaleOnce(locale: UiKitLocale): void {
	if (!registered.value.has(locale.code)) registerLocale(locale)
}

/** Словарь с запасными названиями месяцев и дней для языкового тега Intl: сначала тот же тег, затем тот же основной язык (`kk` для `kk-KZ`) */
export function findCalendarLocale(intl: string): LocaleCore | undefined {
	const candidates = [currentLocale.value, ...registered.value.values()].filter(locale => locale.calendarNames)
	const language = intl.split('-')[0].toLowerCase()
	return (
		candidates.find(locale => locale.intl === intl) ?? candidates.find(locale => locale.intl.split('-')[0].toLowerCase() === language)
	)
}

/** Коды доступных языков: `ru` и зарегистрированные; реактивный список для переключателя языка */
export const localeCodes = computed(() => [...new Set([DEFAULT_LOCALE.code, ...registered.value.keys()])])

/** Две строки раздела `warnings` для `setLocale`: русские — из `ruLocaleWarnings`, поэтому смена языка не тянет в сборку весь раздел */
const LOCALE_WARNINGS = /* @__PURE__ */ localized('warnings', ruLocaleWarnings as UiKitLocale['warnings'])

const PACKAGE = '@ramzes1385/rise-ui-kit'

/** Словари с подпути `/locales/<код>`: вместе со словарём приходит шрифт иероглифов (build/plugins/fonts.ts), в корне пакета их нет */
const SUBPATH_LOCALES: readonly string[] = ['zh', 'ja']

/** Код подключения готового словаря для подсказки: `en`, `kk`, `uz` — из корня пакета, `zh` и `ja` — с подпути */
function registerCode(locale: string): string {
	const register = `registerLocale(${locale})`
	if (!SUBPATH_LOCALES.includes(locale)) return `import { ${locale}, registerLocale } from '${PACKAGE}'; ${register}`
	return `import { registerLocale } from '${PACKAGE}'; import { ${locale} } from '${PACKAGE}/locales/${locale}'; ${register}`
}

/** Предупреждение о неизвестном коде: у готового, но не подключённого словаря кита — подсказка, как его подключить */
function warnUnknownLocale(locale: string): void {
	const template = (KIT_LOCALE_CODES as readonly string[]).includes(locale)
		? LOCALE_WARNINGS.UNREGISTERED_LOCALE
		: LOCALE_WARNINGS.UNKNOWN_LOCALE
	console.warn(`[rise-ui-kit] ${formatMessage(template, { locale, locales: localeCodes.value.join(', '), code: registerCode(locale) })}`)
}

/**
 * Меняет язык кита: код зарегистрированного (`registerLocale`) языка, `ru` либо словарь. Неизвестный код оставляет текущий язык
 * и пишет предупреждение; у готового словаря кита, который не подключён (`setLocale('en')` без `registerLocale(en)`), — с подсказкой
 */
export function setLocale(locale: LocaleInput): void {
	if (typeof locale !== 'string') {
		currentLocale.value = locale
		return
	}
	const known = registered.value.get(locale) ?? (locale === DEFAULT_LOCALE.code ? DEFAULT_LOCALE : undefined)
	if (known) currentLocale.value = known
	else warnUnknownLocale(locale)
}

export function getLocale(): ActiveLocale {
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
export function formatNumber(value: number, options?: Intl.NumberFormatOptions, locale: LocaleCore = currentLocale.value): string {
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
	locale: LocaleCore = currentLocale.value,
): string {
	const category = new Intl.PluralRules(locale.intl).select(count)
	return formatMessage(forms[category] ?? forms.other, { n: formatNumber(count, undefined, locale) })
}
