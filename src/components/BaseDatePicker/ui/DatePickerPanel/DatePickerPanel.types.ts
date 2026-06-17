import type { BaseDatePickerCalendarConfig, BaseDatePickerCalendarProps } from '../../model/BaseDatePickerCalendar.types'
import type { CalendarSelectionMode, CalendarVariant } from '@components/BaseCalendar'
import type { CustomClassProp } from '@composables/useCustomClass'

/**
 * Пропсы компонента DatePickerPanel
 */
export interface DatePickerPanelProps extends BaseDatePickerCalendarProps {
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
	/** Общая конфигурация календаря */
	calendarConfig?: BaseDatePickerCalendarConfig
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
