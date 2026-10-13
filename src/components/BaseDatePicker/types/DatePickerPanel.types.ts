import type { UiClassFn } from '@composables/base/useUi'
import type { BaseDatePickerPart } from './BaseDatePicker.types'
import type { DatePickerPresetItem } from './DatePickerRange.types'
import type { CustomClassProp } from '@composables/base/useCustomClass'
import type { CalendarSelectionMode, CalendarVariant } from '@components/BaseCalendar'
import type { BaseDatePickerCalendarConfig, BaseDatePickerCalendarProps } from './BaseDatePickerCalendar.types'

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
	/** Тема бренда области поля (`data-rise-theme`) */
	riseTheme?: string | null
	/** Пресет движения области поля (`data-rise-motion`): панель двигается как поле, а не как `<html>` */
	motionPreset?: string | null
	/** Готовые периоды (только режим `range`): колонка кнопок слева от календарей */
	presets?: DatePickerPresetItem[]
	/** Наименьшая длина диапазона в днях */
	minDays?: number | null
	/** Наибольшая длина диапазона в днях */
	maxDays?: number | null
	/** Кастомные классы */
	customClass?: CustomClassProp
	/** Общая конфигурация календаря */
	calendarConfig?: BaseDatePickerCalendarConfig
	/** Классы частей дейтпикера: `ui` родителя (`.base-date-picker__<часть>` и классы из пропа `ui`) */
	partClass?: UiClassFn<BaseDatePickerPart>
}

export interface DatePickerPanelEmits {
	(event: 'model-update', value: Date | null): void
	(event: 'model-end-update', value: Date | null): void
	(event: 'selected-update', value: Date[]): void
	(event: 'range-select', start: Date, end: Date): void
	(event: 'preset-select', id: string): void
}
