import type { ComputedRef } from 'vue'
import type { LocaleInput, PluralForms, UiKitLocale } from '@/locales/types/locales.types'

export interface UseLocaleReturn {
	/** Код текущего языка: `ru`, `en` */
	locale: ComputedRef<string>
	/** Словарь текущего языка */
	messages: ComputedRef<UiKitLocale>
	/** Меняет язык кита: код встроенного языка или словарь (`defineLocale`) */
	setLocale: (locale: LocaleInput) => void
	/** Число в формате языка: `1 234,5` по-русски, `1,234.5` по-английски */
	formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string
	/** Дата в формате языка */
	formatDate: (date: Date | number, options?: Intl.DateTimeFormatOptions) => string
	/** Строка для числа по правилам языка: 1 файл, 3 файла, 5 файлов. `{n}` — число */
	plural: (forms: PluralForms, count: number) => string
	/** Подставляет значения в строку: `{name}` → params.name */
	formatMessage: (template: string, params: Record<string, string | number>) => string
}
