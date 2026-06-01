import type {
	CalendarHighlight,
	CalendarSelectionMode,
	CalendarVariant,
	CalendarWeekday,
	CalendarWeekends,
} from '@components/BaseCalendar'
import type { CustomClassProp } from '@composables/useCustomClass'

/**
 * Пропсы компонента DatePickerPanel
 */
export interface DatePickerPanelProps {
	/** Панель открыта */
	isOpen: boolean
	/** Выбранная дата */
	modelValue?: Date | null
	/** Конец диапазона */
	modelValueEnd?: Date | null
	/** Выбранные даты (multiple) */
	selectedDates?: Date[]
	/** Режим выбора */
	selectionMode: CalendarSelectionMode
	/** Вариант календаря */
	calendarVariant: CalendarVariant
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
	firstDayOfWeek: CalendarWeekday
	/** Показывать время */
	showTime: boolean
	/** Показывать секунды */
	showSeconds: boolean
	/** 24-часовой формат */
	is24Hour: boolean
	/** Показывать номер недели */
	showWeekNumber: boolean
	/** Локаль */
	locale: string
	/** Масштаб размера */
	sizeScale: number
	/** Количество отображаемых месяцев */
	monthsCount: number | string
	/** CSS-стили позиционирования */
	panelStyle: Record<string, string>
	/** Текущая тема */
	theme?: string | null
	/** Кастомные классы */
	customClass?: CustomClassProp
}

/**
 * События компонента DatePickerPanel
 */
export interface DatePickerPanelEmits {
	(event: 'model-update', value: Date | null): void
	(event: 'model-end-update', value: Date | null): void
	(event: 'selected-update', value: Date[]): void
	(event: 'range-select', start: Date, end: Date): void
}
