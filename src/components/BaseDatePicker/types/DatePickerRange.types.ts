import type { Ref } from 'vue'
import type { ComputedRef } from 'vue'
import type { CalendarSelectionMode } from '@components/BaseCalendar'
import type { BaseDatePickerCalendarConfig } from './BaseDatePickerCalendar.types'

/** Встроенные готовые периоды: сегодня, вчера, последние 7 и 30 дней, этот и прошлый месяц */
export const DATE_PICKER_PRESET_IDS = ['today', 'yesterday', 'last7days', 'last30days', 'thisMonth', 'lastMonth'] as const

export type DatePickerPresetId = (typeof DATE_PICKER_PRESET_IDS)[number]

/** Диапазон дат: и начало, и конец входят в него (один день — `start` и `end` в один день) */
export interface DatePickerRange {
	/** Первый день */
	start: Date
	/** Последний день */
	end: Date
}

/**
 * Готовый период в панели диапазона. Нужен `range` (фиксированные даты) или `getRange` (считается при открытии панели,
 * получает сегодняшнюю дату без времени); если заданы оба, берётся `getRange`.
 *
 * @example
 * { id: 'quarter', label: 'Квартал', getRange: today => ({ start: new Date(today.getFullYear(), 0, 1), end: today }) }
 */
export interface BaseDatePickerPreset {
	/** Уникальный идентификатор: подсвечивает активный период, приходит в событие `preset-select` */
	id: string
	/** Подпись кнопки */
	label: string
	/** Фиксированный период */
	range?: DatePickerRange
	/** Период, который считается при открытии панели */
	getRange?: (today: Date) => DatePickerRange
}

/**
 * Что показывать в панели из готовых периодов: `true` — все встроенные (`DATE_PICKER_PRESET_IDS`), `false` — ничего,
 * массив — свой список: встроенный период — строкой-идентификатором, свой — объектом `BaseDatePickerPreset`.
 */
export type BaseDatePickerPresets = boolean | readonly (DatePickerPresetId | BaseDatePickerPreset)[]

/** Причина, по которой введённый вручную период не принят: формат, недоступные даты, короче `minDays`, длиннее `maxDays` */
export const DATE_PICKER_INPUT_ISSUES = ['format', 'unavailable', 'min-days', 'max-days'] as const

export type DatePickerInputIssue = (typeof DATE_PICKER_INPUT_ISSUES)[number]

/** Период панели с признаками: активен (совпадает с выбранным диапазоном), недоступен (нарушает ограничения) */
export interface DatePickerPresetItem {
	id: string
	label: string
	range: DatePickerRange
	isActive: boolean
	isDisabled: boolean
}

/** Пределы длины диапазона в днях, оба конца включительно; `null` — без предела */
export interface DatePickerRangeLimits {
	minDays: number | null
	maxDays: number | null
}

/** Часть даты в порядке записи языка поля */
export type DatePickerDatePart = 'day' | 'month' | 'year'

/** Время, прочитанное из текста поля; `meridiem` — `a` или `p` при записи AM/PM */
export interface DatePickerTimeParts {
	hours: number
	minutes: number
	seconds: number
	meridiem: string | undefined
}

/** Как поле показывает даты: от этого зависит разбор введённого текста */
export interface DatePickerTextOptions {
	locale: string
	showTime: boolean
	showSeconds: boolean
	is24Hour: boolean
}

/** Разобранный текст периода: `end` — `null`, если введено только начало; оба `null` — пустой текст */
export interface DatePickerParsedText {
	start: Date | null
	end: Date | null
}

/** Что нужно разбору списка периодов */
export interface DatePickerPresetsSource {
	presets: BaseDatePickerPresets
	today: Date
}

/** Период после разбора списка: подпись и даты */
export interface DatePickerResolvedPreset {
	id: string
	label: string
	range: DatePickerRange
}

/** Настройки диапазона, которые composable берёт из пропсов компонента */
export interface DatePickerRangeResolved {
	selectionMode: CalendarSelectionMode
	presets: BaseDatePickerPresets
	minDays: number | null
	maxDays: number | null
	isReadonly: boolean
	isDisabled: boolean
}

/** Действия над значением дейтпикера, которыми пользуется ввод и выбор периода */
export interface DatePickerRangeActions {
	handleClear: () => void
	handleModelUpdate: (value: Date | null) => void
	handleModelEndUpdate: (value: Date | null) => void
	handleRangeSelect: (start: Date, end: Date) => void
}

/** Набранный в поле текст, ещё не применённый, и ошибка его разбора */
export interface RangeTextState {
	draft: Ref<string | null>
	inputError: Ref<string>
}

export interface UseDatePickerRangeOptions {
	resolvedProps: ComputedRef<DatePickerRangeResolved>
	calendarConfig: ComputedRef<BaseDatePickerCalendarConfig>
	isOpen: Ref<boolean>
	activeValue: ComputedRef<Date | null>
	activeValueEnd: ComputedRef<Date | null>
	displayValue: ComputedRef<string>
	actions: DatePickerRangeActions
	emit: {
		(event: 'preset-select', id: string, start: Date, end: Date): void
		(event: 'input-invalid', issue: DatePickerInputIssue, text: string): void
	}
}
