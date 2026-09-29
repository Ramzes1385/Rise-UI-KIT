import type { DateFormat } from '@utils/data/dateUtils'
import type { InputVariant } from '@components/BaseInput'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { BaseDatePickerCalendarProps } from './BaseDatePickerCalendar.types'
import type { CalendarSelectionMode, CalendarVariant } from '@components/BaseCalendar'

export interface BaseDatePickerProps extends BaseComponentProps<string, 'root' | 'field' | 'panel'>, BaseDatePickerCalendarProps {
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
	/** Вариант отображения поля — варианты BaseInput. По умолчанию `default`: рамка и фон страницы */
	inputVariant?: InputVariant
	/** Вариант календаря в панели — варианты BaseCalendar. По умолчанию `ghost`: календарь без своей рамки и фона */
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

export interface BaseDatePickerEmits {
	(event: 'update:modelValue', value: Date | null): void
	(event: 'update:modelValueEnd', value: Date | null): void
	(event: 'update:selectedDates', value: Date[]): void
	(event: 'open'): void
	(event: 'close'): void
	(event: 'clear'): void
	(event: 'range-select', start: Date, end: Date): void
}

export interface BaseDatePickerSlots {
	/** Кастомная иконка в инпуте */
	icon?: () => unknown
}

export type DatePickerProps = PropsWithDefaults<BaseDatePickerProps, 'isRequired'>
