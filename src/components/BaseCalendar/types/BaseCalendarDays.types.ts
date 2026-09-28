import type { CalendarHighlight } from './BaseCalendar.types'

export interface BaseCalendarDaysProps {
	/** Показывать номера недель */
	showWeekNumber: boolean
	/** Упорядоченные названия дней недели */
	orderedWeekdays: string[]
	/** Массив дат для отображения в сетке календаря */
	calendarDays: Date[]
	/** Отключён ли весь календарь */
	isDisabled: boolean
	/** Локаль для форматирования дат (доступные имена дней, popover) */
	locale: string
	/** Объект CSS-классов для кастомизации элементов календаря */
	classes: Record<string, string | undefined>
	/** Проверка, является ли дата сегодняшней */
	isToday: (date: Date) => boolean
	/** Проверка, выбрана ли дата */
	isSelected: (date: Date) => boolean
	/** Проверка, отключена ли дата */
	isDayDisabled: (date: Date) => boolean
	/** Проверка, является ли дата выходным днём */
	isWeekend: (date: Date) => boolean
	/** Проверка, входит ли дата в выбранный диапазон */
	isInRange: (date: Date) => boolean
	/** Выделение даты: цвет точки и подпись (подпись попадает в доступное имя дня) */
	getHighlight: (date: Date) => CalendarHighlight | undefined
	/** Получение номера недели для строки сетки */
	getRowWeekNumber: (index: number) => number
	/** Проверка, совпадают ли две даты (один и тот же день) */
	isSameDay: (a: Date, b: Date) => boolean
	/** Вычисление CSS-классов для дня */
	dayClasses: (date: Date, isCustomSlot: boolean) => Record<string, boolean>
	/** Дата, для которой открыт popover (null — закрыт) */
	popoverDate: Date | null
	/** Выделения (подсветки) для popover */
	popoverHighlights: CalendarHighlight[]
	/** Функция закрытия popover */
	closePopover: () => void
}

export interface BaseCalendarDaysEmits {
	dayClick: [date: Date]
}

export interface BaseCalendarDaysSlots {
	day?(props: { date: Date; isToday: boolean; isSelected: boolean; isDisabled: boolean; isWeekend: boolean; isInRange: boolean }): unknown
	'date-popover'?(props: { date: Date; close: () => void; highlights: CalendarHighlight[] }): unknown
}
