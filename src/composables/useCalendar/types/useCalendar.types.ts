/** Режим выбора календаря */
export type CalendarSelectionMode = 'single' | 'range' | 'multiple'

/** Вид календаря */
export type CalendarView = 'days' | 'months' | 'years'

/** День недели (0 = воскресенье, 6 = суббота) */
export type CalendarWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** Событие календаря */
export interface CalendarEvent {
	/** Дата события */
	date: Date
	/** Заголовок */
	label: string
	/** Цвет (CSS-переменная или hex) */
	color?: string
}

/** Выделенная дата */
export interface CalendarHighlight {
	/** Дата */
	date: Date
	/** Цвет (CSS-переменная или hex) */
	color?: string
	/** CSS-класс */
	cssClass?: string
	/** Подпись (отображается в popover) */
	label?: string
}

/** Конфигурация выходных дней */
export interface CalendarWeekends {
	/** Дни недели, считающиеся выходными (0=вс, 1=пн, ..., 6=сб) */
	days: CalendarWeekday[]
	/** Праздничные даты */
	holidays: Date[]
}

/** Опции хука useCalendar */
export interface UseCalendarOptions {
	selectionMode: () => CalendarSelectionMode
	modelValue: () => Date | null
	modelValueEnd: () => Date | null
	selectedDates: () => Date[]
	minDate: () => Date | null
	maxDate: () => Date | null
	disabledDates: () => Date[]
	disabledWeekdays: () => CalendarWeekday[]
	disableFrom: () => Date | null
	disableTo: () => Date | null
	highlights: () => CalendarHighlight[]
	weekends: () => CalendarWeekends | null
	firstDayOfWeek: () => CalendarWeekday
	locale: () => string
	initialMonth?: () => number | undefined
	initialYear?: () => number | undefined
	showYear?: () => boolean | undefined
}
