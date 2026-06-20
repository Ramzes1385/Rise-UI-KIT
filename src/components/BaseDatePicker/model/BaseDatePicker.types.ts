import type { BaseComponentProps } from '../../../types/base.types'
import type { BaseDatePickerCalendarProps } from './BaseDatePickerCalendar.types'
import type { CalendarSelectionMode, CalendarVariant } from '@components/BaseCalendar'
import type { InputVariant } from '@components/BaseInput'
import type { DateFormat } from '@utils/dateUtils'

/**
 * Пропсы компонента BaseDatePicker
 */
export interface BaseDatePickerProps extends BaseComponentProps, BaseDatePickerCalendarProps {
	/** Выбранная дата */
	modelValue?: Date | null
	/** Конец диапазона (для range) */
	modelValueEnd?: Date | null
	/** Выбранные даты (для multiple) */
	selectedDates?: Date[]
	/** Режим выбора */
	selectionMode?: CalendarSelectionMode
	/** Плейсхолдер инпута */
	placeholder?: string
	/** Формат даты в инпуте */
	dateFormat?: DateFormat
	/** Вариант отображения инпута */
	inputVariant?: InputVariant
	/** Вариант отображения календаря */
	calendarVariant?: CalendarVariant
	/** Общая конфигурация календаря */
	calendarConfig?: BaseDatePickerCalendarProps
	/** Отключён */
	isDisabled?: boolean
	/** Только для чтения */
	isReadonly?: boolean
	/** Лейбл */
	label?: string
	/** Ошибка */
	error?: string
	/** Обязательное поле */
	isRequired?: boolean
	/** Показывать кнопку очистки */
	isClearable?: boolean
	/** Закрытие по клику вне */
	closeOnClickOutside?: boolean
	/** Закрытие по Escape */
	closeOnEscape?: boolean
	/** Отступ от инпута (px) */
	gap?: number
	/** Автоматически подстраивать количество месяцев под ширину поля */
	isMultiMonth?: boolean
}

/**
 * События компонента BaseDatePicker
 */
export interface BaseDatePickerEmits {
	(event: 'update:modelValue', value: Date | null): void
	(event: 'update:modelValueEnd', value: Date | null): void
	(event: 'update:selectedDates', value: Date[]): void
	(event: 'open'): void
	(event: 'close'): void
	(event: 'clear'): void
	(event: 'range-select', start: Date, end: Date): void
}

/**
 * Слоты компонента BaseDatePicker
 */
export interface BaseDatePickerSlots {
	/** Кастомная иконка в инпуте */
	icon?: () => unknown
}
