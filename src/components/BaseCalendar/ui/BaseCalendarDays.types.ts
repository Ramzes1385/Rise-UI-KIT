import type { CalendarHighlight, CalendarView } from '../model/BaseCalendar.types'

/** Props компонента BaseCalendarDays */
export interface BaseCalendarDaysProps {
	/** Текущий вид календаря (дни / месяцы / годы) */
	currentView: CalendarView
	/** Показывать номера недель */
	showWeekNumber: boolean
	/** Упорядоченные названия дней недели */
	orderedWeekdays: string[]
	/** Массив дат для отображения в сетке календаря */
	calendarDays: Date[]
	/** Масштаб размера (базовая единица sizeScale) */
	sizeScale: number
	/** Отключён ли весь календарь */
	isDisabled: boolean
	/** Локаль для форматирования дат */
	locale: string
	/** Объект CSS-классов для кастомизации элементов календаря */
	classes: Record<string, string>
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
	/** Получение выделения (цвет точки) для даты */
	getHighlight: (date: Date) => { color?: string } | undefined
	/** Получение номера недели для строки сетки */
	getRowWeekNumber: (index: number) => number
	/** Проверка, совпадают ли две даты (один и тот же день) */
	isSameDay: (a: Date, b: Date) => boolean
	/** Вычисление CSS-классов для дня */
	dayClasses: (date: Date, isCustomSlot: boolean) => Record<string, boolean>
	/** Дата, для которой открыт popover (null — закрыт) */
	popoverDate: Date | null
	/** CSS-стили позиционирования popover */
	popoverStyle: Record<string, string>
	/** Выделения (подсветки) для popover */
	popoverHighlights: CalendarHighlight[]
	/** Функция закрытия popover */
	closePopover: () => void
}
