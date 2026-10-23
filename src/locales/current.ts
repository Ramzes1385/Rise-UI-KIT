/** Текущий язык кита: один на страницу; по умолчанию — русский без строк (строки берут разделы `messages.ts`), иначе словарь целиком */
import { shallowRef } from 'vue'
import type { ActiveLocale } from './types/locales.types'

/** Русский по умолчанию: код, тег Intl и первый день недели — строки каждый раздел `messages.ts` берёт из своего раздела `ru` */
export const DEFAULT_LOCALE: ActiveLocale = { code: 'ru', intl: 'ru-RU', firstDayOfWeek: 1 }

/** Текущий язык: shallowRef — компоненты перерисовываются при смене языка */
export const currentLocale = shallowRef<ActiveLocale>(DEFAULT_LOCALE)
