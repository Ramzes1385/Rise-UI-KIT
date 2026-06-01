import type {
	CalendarHighlight,
	CalendarSelectionMode,
	CalendarVariant,
	CalendarWeekday,
	CalendarWeekends,
} from '@components/BaseCalendar'
import type { InputVariant } from '@components/BaseInput'
import type { CustomClassProp } from '@composables/useCustomClass'
import type { CustomColor } from '@composables/useCustomColor'
import type { DateFormat } from '@utils/dateUtils'

/**
 * Пропсы компонента BaseDatePicker
 */
export interface BaseDatePickerProps {
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
	/** Кастомный цвет */
	color?: CustomColor
	/** Масштаб размера */
	sizeScale?: number
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
	/** Закрытие по клику вне */
	closeOnClickOutside?: boolean
	/** Закрытие по Escape */
	closeOnEscape?: boolean
	/** Отступ от инпута (px) */
	gap?: number
	/** Автоматически подстраивать количество месяцев под ширину поля */
	isMultiMonth?: boolean
	/** Кастомные классы */
	customClass?: CustomClassProp
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
