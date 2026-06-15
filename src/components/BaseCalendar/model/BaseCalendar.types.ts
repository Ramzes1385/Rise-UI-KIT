import type { CustomClassProp } from '@composables/useCustomClass'
import type { CustomColor } from '@composables/useCustomColor'

/** Варианты отображения календаря */
export const CALENDAR_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/** Тип варианта календаря */
export type CalendarVariant = (typeof CALENDAR_VARIANTS)[number]

/**
 * Режим выбора календаря
 */
export type CalendarSelectionMode = 'single' | 'range' | 'multiple'

/**
 * Вид календаря
 */
export type CalendarView = 'days' | 'months' | 'years'

/**
 * День недели (0 = воскресенье, 6 = суббота)
 */
export type CalendarWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

/**
 * Событие календаря
 */
export interface CalendarEvent {
	/** Дата события */
	date: Date
	/** Заголовок */
	label: string
	/** Цвет (CSS-переменная или hex) */
	color?: string
}

/**
 * Выделенная дата
 */
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

/**
 * Конфигурация выходных дней
 */
export interface CalendarWeekends {
	/** Дни недели, считающиеся выходными (0=вс, 1=пн, ..., 6=сб) */
	days: CalendarWeekday[]
	/** Праздничные даты */
	holidays: Date[]
}

/**
 * Пропсы компонента BaseCalendar
 */
export interface BaseCalendarProps {
	/** Выбранная дата / начало диапазона */
	modelValue?: Date | null
	/** Конец диапазона (для range) */
	modelValueEnd?: Date | null
	/** Выбранные даты (для multiple) */
	selectedDates?: Date[]
	/** Режим выбора */
	selectionMode?: CalendarSelectionMode
	/** Минимальная дата */
	minDate?: Date | null
	/** Максимальная дата */
	maxDate?: Date | null
	/** Выключенные даты */
	disabledDates?: Date[]
	/** Выключенные дни недели */
	disabledWeekdays?: CalendarWeekday[]
	/** Выключить даты начиная с (отключает все после) */
	disableFrom?: Date | null
	/** Выключить даты до (отключает все до) */
	disableTo?: Date | null
	/** Выделенные даты */
	highlights?: CalendarHighlight[]
	/** События */
	events?: CalendarEvent[]
	/** Конфигурация выходных */
	weekends?: CalendarWeekends | null
	/** Первый день недели (0=вс, 1=пн) */
	firstDayOfWeek?: CalendarWeekday
	/** Показывать выбор времени */
	showTime?: boolean
	/** Показывать секунды */
	showSeconds?: boolean
	/** Формат времени 24ч */
	is24Hour?: boolean
	/** Показывать номер недели */
	showWeekNumber?: boolean
	/** Локаль */
	locale?: string
	/** Вариант отображения */
	variant?: CalendarVariant
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Показывать popover при клике на дату */
	showDatePopover?: boolean
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Отключённый календарь */
	isDisabled?: boolean
	/** Показывать кнопки навигации в шапке */
	showNavigation?: boolean
	/** Разрешить переключение вида (месяцы/годы) при клике на заголовок */
	canSwitchView?: boolean
	/** Показывать кнопку "Сегодня" в подвале */
	showTodayButton?: boolean
	/** Показывать год в заголовке */
	showYear?: boolean
	/** Начальный месяц (0-11). Если не задан — текущий */
	initialMonth?: number
	/** Начальный год. Если не задан — текущий */
	initialYear?: number
	/** Кастомные классы для стилизации внутренних элементов */
	customClass?: CustomClassProp
}

/**
 * События компонента BaseCalendar
 */
export interface BaseCalendarEmits {
	(event: 'update:modelValue', value: Date | null): void
	(event: 'update:modelValueEnd', value: Date | null): void
	(event: 'update:selectedDates', value: Date[]): void
	(event: 'date-click', date: Date): void
	(event: 'range-select', start: Date, end: Date): void
	(event: 'month-change', month: number): void
	(event: 'year-change', year: number): void
	(event: 'view-change', view: CalendarView): void
}

/**
 * Слоты компонента BaseCalendar
 */
export interface BaseCalendarSlots {
	/** Кастомная ячейка дня */
	day?: (props: {
		date: Date
		isToday: boolean
		isSelected: boolean
		isDisabled: boolean
		isWeekend: boolean
		isInRange: boolean
	}) => unknown
	/** Кастомный заголовок */
	header?: (props: { month: number; year: number }) => unknown
	/** Кастомный popover для даты */
	datePopover?: (props: { date: Date; close: () => void; highlights: CalendarHighlight[] }) => unknown
	/** Кастомное событие */
	event?: (props: { event: CalendarEvent }) => unknown
	/** Кастомная навигация */
	navigation?: () => unknown
}
