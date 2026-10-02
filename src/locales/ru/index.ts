import { ruBase } from './base'
import { ruChat } from './chat'
import { ruData } from './data'
import { ruForms } from './forms'
import { ruMedia } from './media'
import { ruPlural } from './plural'
import { ruEventCalendar } from './eventCalendar'
/** Русский словарь кита (язык по умолчанию); ключи совпадают с `UI_TEXT`, `UI_ARIA` и др.; `{name}` — место для значения (formatMessage), `plural` — формы чисел (Intl.PluralRules). */
export const ru = {
	code: 'ru',
	/** Языковой тег для Intl: даты, числа, множественное число */
	intl: 'ru-RU',
	/** Первый день недели в календаре: 0 — воскресенье, 1 — понедельник */
	firstDayOfWeek: 1,
	...ruBase,
	...ruForms,
	...ruMedia,
	...ruChat,
	...ruData,
	...ruEventCalendar,
	plural: ruPlural,
}
