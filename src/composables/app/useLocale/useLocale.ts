/** Composable: язык кита — строки интерфейса, даты, числа и множественное число */
import { computed } from 'vue'
import { ru } from '@/locales/ru'
import { DEFAULT_LOCALE } from '@/locales/current'
import { formatDateText } from '@utils/data/dateFormatUtils'
import type { UseLocaleReturn } from './types/useLocale.types'
import type { UiKitLocale } from '@/locales/types/locales.types'
import { currentLocale, formatMessage, formatNumber, localeCodes, pluralize, setLocale } from '@/locales/state'

/**
 * Язык кита: один на страницу. По умолчанию русский; `setLocale('en')`, `createUiKitPlugin({ locale })`
 * или `<BaseApp locale="en">` переключают строки интерфейса, формат дат, чисел и первый день недели в календаре.
 *
 * @example
 * const { locale, setLocale, plural } = useLocale()
 * setLocale('en')
 * plural({ one: '{n} file', other: '{n} files' }, 3) // '3 files'
 */
export function useLocale(): UseLocaleReturn {
	return {
		locale: computed(() => currentLocale.value.code),
		locales: localeCodes,
		messages: computed(() => (currentLocale.value === DEFAULT_LOCALE ? ru : (currentLocale.value as UiKitLocale))),
		setLocale,
		formatNumber: (value, options) => formatNumber(value, options),
		formatDate: (date, options) => formatDateText(date, options ?? {}, currentLocale.value.intl),
		plural: (forms, count) => pluralize(forms, count),
		formatMessage,
	}
}
