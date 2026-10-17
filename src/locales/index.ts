import { en } from './en'
import { ru } from './ru'
import type { UiKitLocale } from './types/locales.types'

export { en } from './en'
export { ja } from './ja'
export { kk } from './kk'
export { ru } from './ru'
export { uz } from './uz'
export { zh } from './zh'
export { defineLocale, formatMessage, pluralize, registerLocale, setLocale } from './state'
export type {
	CalendarNames,
	CalendarPatterns,
	KitLocaleCode,
	LocaleInput,
	LocaleOverrides,
	PluralForms,
	RelativeTimeNames,
	RelativeTimeUnit,
	UiKitLocale,
} from './types/locales.types'

/**
 * Готовые словари `ru` и `en` (прежний список встроенных языков; сам кит его не читает).
 *
 * @deprecated Встроен только `ru`; `en` подключается `registerLocale(en)` (`createUiKitPlugin` подключает его сам). Словари импортируйте
 * напрямую: `import { en, ru } from '@ramzes1385/rise-ui-kit'`
 */
export const LOCALES = { ru: ru as UiKitLocale, en } as const
