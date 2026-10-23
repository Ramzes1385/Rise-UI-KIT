/** Сведения о неделе языка (`Intl.Locale`): `firstDay` — 1 (понедельник) … 7 (воскресенье) */
interface LocaleWeekInfo {
	firstDay?: number
}

/** `Intl.Locale` с сведениями о неделе: метод `getWeekInfo()` (новые движки) или свойство `weekInfo` (Chrome 99+, Safari) */
export interface LocaleWithWeekInfo {
	getWeekInfo?: () => LocaleWeekInfo
	weekInfo?: LocaleWeekInfo
}
