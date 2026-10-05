import type { UiProp } from '@composables/base/useUi'
import type { DateFormat } from '@utils/data/dateUtils'
import type { InputVariant } from '@components/BaseInput'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { BaseDatePickerCalendarProps } from './BaseDatePickerCalendar.types'
import type { CalendarSelectionMode, CalendarVariant } from '@components/BaseCalendar'

/**
 * Части дейтпикера для пропа `ui` (`root` — корень `.base-date-picker`). Свои части получают БЭМ-класс
 * `.base-date-picker__<часть>` рядом с прежним классом подкомпонента: field — поле (`.date-picker-field`), suffix — кнопки
 * справа в поле, clear-btn — «Очистить», icon-btn — кнопка календаря, panel — панель (`.date-picker-panel`), header — шапка
 * панели, nav-group — группа стрелок, nav-btn — стрелка месяца или года, year-title — год, months — ряд месяцев,
 * calendar — календарь месяца (BaseCalendar). Части внутреннего BaseInput получают классы без БЭМ-класса дейтпикера:
 * label, required — звёздочка, wrapper — рамка поля, input — `<input>` (`.base-input__field`), error-text.
 */
export const DATE_PICKER_PARTS = [
	'field',
	'label',
	'required',
	'wrapper',
	'input',
	'error-text',
	'suffix',
	'clear-btn',
	'icon-btn',
	'panel',
	'header',
	'nav-group',
	'nav-btn',
	'year-title',
	'months',
	'calendar',
] as const

export type BaseDatePickerPart = (typeof DATE_PICKER_PARTS)[number]

/** Части поля внутреннего BaseInput и их имена в `DATE_PICKER_PARTS` */
export const DATE_PICKER_INPUT_PARTS = {
	label: 'label',
	required: 'required',
	wrapper: 'wrapper',
	field: 'input',
	'error-text': 'error-text',
} as const satisfies Record<string, BaseDatePickerPart>

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
	/** Панель шириной с поле, месяцев в ней — столько, сколько помещается по ширине (2, 3 и больше). По умолчанию `true`; `false` — один месяц, панель по ширине календаря */
	isMultiMonth?: boolean
	/** Предел числа месяцев в панели при `isMultiMonth`. По умолчанию без предела */
	maxMonths?: number
	/**
	 * Классы частей (`root`, `field`, `wrapper`, `panel`, `header`, `nav-btn`, `calendar`… — см. `DATE_PICKER_PARTS`) — добавляются
	 * к классам кита, в том числе в панели. Глобально — `defaults.BaseDatePicker.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BaseDatePicker :ui="{ wrapper: 'shadow-sm', panel: 'rounded-xl', calendar: 'p-2' }" />
	 */
	ui?: UiProp<BaseDatePickerPart>
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
