import type { BaseCalendarProps, CalendarHighlight, CalendarWeekday, CalendarWeekends } from '@components/BaseCalendar'

/**
 * Общие календарные пропсы для BaseDatePicker и внутренних панелей.
 */
export interface BaseDatePickerCalendarProps {
	/** Минимальная дата */
	minDate?: Date | null
	/** Максимальная дата */
	maxDate?: Date | null
	/** Выключенные даты */
	disabledDates?: Date[]
	/** Выключенные дни недели */
	disabledWeekdays?: CalendarWeekday[]
	/** Выключить даты начиная с */
	disableFrom?: Date | null
	/** Выключить даты до */
	disableTo?: Date | null
	/** Выделенные даты */
	highlights?: CalendarHighlight[]
	/** Конфигурация выходных */
	weekends?: CalendarWeekends | null
	/** Первый день недели */
	firstDayOfWeek?: CalendarWeekday
	/** Локаль */
	locale?: string
	/** Показывать время */
	showTime?: boolean
	/** Показывать секунды */
	showSeconds?: boolean
	/** Формат 24ч */
	is24Hour?: boolean
	/** Показывать номер недели */
	showWeekNumber?: boolean
}

export type BaseDatePickerCalendarConfig = Required<BaseDatePickerCalendarProps>

/**
 * Параметры отображения календаря внутри панели date picker (зависят от количества месяцев).
 */
export interface DatePickerCalendarDisplay {
	/** Показывать год в заголовке месяца */
	showYear: boolean
	/** Показывать кнопку «Сегодня» */
	showTodayButton: boolean
}

/**
 * Props BaseCalendar, которые формирует панель date picker.
 */
export type DatePickerCalendarBindings = Required<
	Pick<BaseCalendarProps, 'constraints' | 'displayConfig' | 'firstDayOfWeek' | 'highlights' | 'locale' | 'timeConfig' | 'weekends'>
>
