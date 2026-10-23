import type { CalendarNames } from '@/locales/types/locales.types'

/** Форматировщик дат: `Intl.DateTimeFormat` либо запасной на словаре языка (`calendarNames`); у запасного `formatRange` просто соединяет две даты */
export interface DateFormatter {
	format: (date?: Date | number) => string
	formatRange: (start: Date | number, end: Date | number) => string
}

/** Вид названий: `long` — «сәрсенбі», `short` — «ср» */
export type DateNameStyle = 'long' | 'short'

/** Часть числовой даты языка: порядок частей определяет разбор введённого текста */
export type NumericDatePart = 'day' | 'month' | 'year'

/** Что нужно запасному формату: названия языка, языковой тег (регистр) и параметры формата */
export interface FallbackContext {
	names: CalendarNames
	locale: string
	options: Intl.DateTimeFormatOptions
}

/** Части даты для запасного формата: месяц от 0 до 11, день недели от 0 (воскресенье) до 6 */
export interface DateFields {
	year: number
	month: number
	day: number
	weekday: number
}

/** Значения для подстановки в шаблон даты словаря */
export interface DateTexts {
	day: string
	month: string
	year: string
}
