/** Composable: язык кита — строки интерфейса, даты, числа и множественное число */
import { computed } from 'vue'
import type { UseLocaleReturn } from './types/useLocale.types'
import { currentLocale, formatMessage, formatNumber, pluralize, setLocale } from '@/locales/state'

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
		messages: computed(() => currentLocale.value),
		setLocale,
		formatNumber: (value, options) => formatNumber(value, options),
		formatDate: (date, options) => new Intl.DateTimeFormat(currentLocale.value.intl, options).format(date),
		plural: (forms, count) => pluralize(forms, count),
		formatMessage,
	}
}
