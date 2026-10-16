/** Утилиты: первый день недели по языку — из `Intl.Locale` (`getWeekInfo()` / `weekInfo`) с запасом на язык кита */
import { getLocale } from '@/locales/state'
import type { LocaleWithWeekInfo } from './types/weekUtils.types'

const DAYS_IN_WEEK = 7

function readFirstDay(tag: string): number | null {
	try {
		const locale = new Intl.Locale(tag) as unknown as LocaleWithWeekInfo
		const info = typeof locale.getWeekInfo === 'function' ? locale.getWeekInfo() : locale.weekInfo
		const firstDay = info?.firstDay
		return typeof firstDay === 'number' && firstDay >= 1 && firstDay <= DAYS_IN_WEEK ? firstDay % DAYS_IN_WEEK : null
	} catch {
		return null
	}
}

/**
 * Первый день недели для явного `locale` компонента: 0 — воскресенье … 6. Без `locale` и при `locale`, равном языку кита
 * (`intl`), берётся `firstDayOfWeek` языка кита — его задаёт автор словаря (`defineLocale`). Иной `locale` читается из
 * `Intl.Locale` (`getWeekInfo()`, иначе `weekInfo`); нет API или язык не разобран — запасной вариант `firstDayOfWeek` кита.
 */
function resolveFirstDayOfWeek(locale?: string | null): number {
	const kitLocale = getLocale()
	if (!locale || locale === kitLocale.intl) return kitLocale.firstDayOfWeek
	return readFirstDay(locale) ?? kitLocale.firstDayOfWeek
}

export { resolveFirstDayOfWeek }
