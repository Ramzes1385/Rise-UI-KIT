import type { UseCalendarDateStateOptions } from './useCalendarDateState.types'
import type { UseCalendarViewNavigationOptions } from './useCalendarViewNavigation.types'

/** Месяц календаря: год и номер месяца (0 = январь) */
export interface CalendarMonthPosition {
	year: number
	month: number
}

/** Направление шага по календарю: назад или вперёд */
export type CalendarStepDirection = -1 | 1

/** Источники ограничений дня: отключённые даты, дни недели и границы диапазона */
export type CalendarDayLimits = Pick<
	UseCalendarDateStateOptions,
	'disabledDates' | 'disabledWeekdays' | 'minDate' | 'maxDate' | 'disableFrom' | 'disableTo'
>

/** Источники отметок дня: ограничения, подсветки и выходные */
export type CalendarDayMarkerOptions = CalendarDayLimits & Pick<UseCalendarDateStateOptions, 'highlights' | 'weekends'>

/** Видимая часть календаря: месяц, год и вид отображения */
export type CalendarViewState = Pick<UseCalendarViewNavigationOptions, 'currentMonth' | 'currentYear' | 'currentView'>

/** Границы для перехода к предыдущему месяцу */
export type CalendarPrevLimits = Pick<UseCalendarViewNavigationOptions, 'minDate' | 'disableTo'>

/** Границы для перехода к следующему месяцу */
export type CalendarNextLimits = Pick<UseCalendarViewNavigationOptions, 'maxDate' | 'disableFrom'>
