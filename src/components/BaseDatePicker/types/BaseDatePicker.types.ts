import type { UiProp } from '@composables/base/useUi'
import type { DateFormat } from '@utils/data/dateUtils'
import type { InputVariant } from '@components/BaseInput'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { BaseDatePickerCalendarProps } from './BaseDatePickerCalendar.types'
import type { CalendarSelectionMode, CalendarVariant } from '@components/BaseCalendar'
import type { BaseDatePickerPresets, DatePickerInputIssue } from './DatePickerRange.types'

/**
 * Части дейтпикера для пропа `ui` (`root` — корень `.base-date-picker`). Свои части получают БЭМ-класс
 * `.base-date-picker__<часть>` рядом с прежним классом подкомпонента: field — поле (`.date-picker-field`), suffix — кнопки
 * справа в поле, clear-btn — «Очистить», icon-btn — кнопка календаря, panel — панель (`.date-picker-panel`), header — шапка
 * панели, nav-group — группа стрелок, nav-btn — стрелка месяца или года, year-title — год, months — ряд месяцев,
 * calendar — календарь месяца (BaseCalendar), presets — колонка готовых периодов диапазона, preset — её кнопка. Части внутреннего BaseInput получают классы без БЭМ-класса дейтпикера:
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
	'presets',
	'preset',
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
	/**
	 * Формат даты в инпуте. Поле показывает даты в формате локали (`locale`), а текст диапазона разбирается в том же порядке
	 * «день, месяц, год», что и показывается; нестандартный порядок задаётся локалью, а не этим пропом
	 */
	dateFormat?: DateFormat
	/** Вариант отображения поля — варианты BaseInput. По умолчанию `default`: рамка и фон страницы */
	inputVariant?: InputVariant
	/** Вариант календаря в панели — варианты BaseCalendar. По умолчанию `ghost`: календарь без своей рамки и фона */
	calendarVariant?: CalendarVariant
	/** Общая конфигурация календаря */
	calendarConfig?: BaseDatePickerCalendarProps
	/** Отключён */
	isDisabled?: boolean
	/** Только для чтения. По умолчанию `true`: период выбирается в панели; `false` — в режиме `range` период можно вводить в поле (Enter или уход из поля применяют ввод, Escape отменяет) */
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
	 * Число месяцев в панели. Без значения — по ширине поля (`isMultiMonth`, `maxMonths`); число — ровно столько, панель по ширине
	 * месяцев, а не поля, `maxMonths` не действует (на узком экране панель прокручивается). Для двух месяцев рядом — `2`
	 */
	monthsShown?: number
	/**
	 * Готовые периоды в панели диапазона (`selectionMode="range"`): `true` — встроенные («Сегодня», «Вчера», «7 дней», «30 дней»,
	 * «Этот месяц», «Прошлый месяц»), массив — свой список (`'today'` — встроенный, объект `{ id, label, range | getRange }` — свой).
	 * Клик ставит диапазон и закрывает панель; активный период подсвечен, период, нарушающий ограничения, отключён
	 */
	presets?: BaseDatePickerPresets
	/**
	 * Наименьшая длина диапазона в днях, оба конца включительно (`1` — один день допустим). После выбора начала дни, дающие более
	 * короткий диапазон, отключены; готовые периоды и введённый текст короче — отклоняются
	 */
	minDays?: number
	/**
	 * Наибольшая длина диапазона в днях, оба конца включительно. После выбора начала дальние дни отключены; длинные готовые
	 * периоды и введённый текст длиннее — отклоняются. Меньше `minDays` приравнивается к `minDays`
	 */
	maxDays?: number
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
	/** Выбран готовый период из панели: его `id` и границы; после него приходят `update:modelValue`, `update:modelValueEnd` и `range-select` */
	(event: 'preset-select', id: string, start: Date, end: Date): void
	/** Введённый вручную период не принят (`format`, `unavailable`, `min-days`, `max-days`): текст остаётся в поле с ошибкой */
	(event: 'input-invalid', issue: DatePickerInputIssue, text: string): void
}

export interface BaseDatePickerSlots {
	/** Кастомная иконка в инпуте */
	icon?: () => unknown
}

export type DatePickerProps = PropsWithDefaults<BaseDatePickerProps, 'isRequired'>
