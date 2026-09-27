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

function applyExplicitCalendarProp<Key extends keyof BaseDatePickerCalendarProps>(
	target: BaseDatePickerCalendarProps,
	source: BaseDatePickerCalendarProps,
	wasPropPassed: (name: string) => boolean,
	name: Key,
): void {
	if (!wasPropPassed(name)) return
	target[name] = source[name]
}

export function pickDatePickerCalendarConfig(source: BaseDatePickerCalendarProps): BaseDatePickerCalendarConfig {
	return {
		minDate: source.minDate ?? null,
		maxDate: source.maxDate ?? null,
		disabledDates: source.disabledDates ?? [],
		disabledWeekdays: source.disabledWeekdays ?? [],
		disableFrom: source.disableFrom ?? null,
		disableTo: source.disableTo ?? null,
		highlights: source.highlights ?? [],
		weekends: source.weekends ?? null,
		firstDayOfWeek: source.firstDayOfWeek ?? 1,
		locale: source.locale ?? 'ru-RU',
		showTime: source.showTime ?? false,
		showSeconds: source.showSeconds ?? false,
		is24Hour: source.is24Hour ?? true,
		showWeekNumber: source.showWeekNumber ?? false,
	}
}

export function resolveDatePickerCalendarConfig(
	source: BaseDatePickerCalendarProps,
	wasPropPassed: (name: string) => boolean,
	config?: BaseDatePickerCalendarProps,
): BaseDatePickerCalendarConfig {
	const merged: BaseDatePickerCalendarProps = { ...(config ?? {}) }

	applyExplicitCalendarProp(merged, source, wasPropPassed, 'minDate')
	applyExplicitCalendarProp(merged, source, wasPropPassed, 'maxDate')
	applyExplicitCalendarProp(merged, source, wasPropPassed, 'disabledDates')
	applyExplicitCalendarProp(merged, source, wasPropPassed, 'disabledWeekdays')
	applyExplicitCalendarProp(merged, source, wasPropPassed, 'disableFrom')
	applyExplicitCalendarProp(merged, source, wasPropPassed, 'disableTo')
	applyExplicitCalendarProp(merged, source, wasPropPassed, 'highlights')
	applyExplicitCalendarProp(merged, source, wasPropPassed, 'weekends')
	applyExplicitCalendarProp(merged, source, wasPropPassed, 'firstDayOfWeek')
	applyExplicitCalendarProp(merged, source, wasPropPassed, 'locale')
	applyExplicitCalendarProp(merged, source, wasPropPassed, 'showTime')
	applyExplicitCalendarProp(merged, source, wasPropPassed, 'showSeconds')
	applyExplicitCalendarProp(merged, source, wasPropPassed, 'is24Hour')
	applyExplicitCalendarProp(merged, source, wasPropPassed, 'showWeekNumber')

	return pickDatePickerCalendarConfig(merged)
}

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

/**
 * Преобразует плоскую конфигурацию date picker в props BaseCalendar.
 * С 1.2.2 BaseCalendar принимает ограничения, время и отображение только группами
 * (constraints/timeConfig/displayConfig): плоские ключи уходили бы в $attrs и молча игнорировались.
 * Навигация и смена вида календаря отключены — их выполняет шапка панели.
 */
export function toBaseCalendarProps(
	config: BaseDatePickerCalendarConfig,
	display: DatePickerCalendarDisplay,
): DatePickerCalendarBindings {
	return {
		constraints: {
			minDate: config.minDate,
			maxDate: config.maxDate,
			disabledDates: config.disabledDates,
			disabledWeekdays: config.disabledWeekdays,
			disableFrom: config.disableFrom,
			disableTo: config.disableTo,
		},
		timeConfig: {
			showTime: config.showTime,
			showSeconds: config.showSeconds,
			is24Hour: config.is24Hour,
		},
		displayConfig: {
			showNavigation: false,
			canSwitchView: false,
			showYear: display.showYear,
			showTodayButton: display.showTodayButton,
			showWeekNumber: config.showWeekNumber,
		},
		highlights: config.highlights,
		weekends: config.weekends,
		firstDayOfWeek: config.firstDayOfWeek,
		locale: config.locale,
	}
}

/**
 * Props календаря без блока времени. Время относится к выбранному значению, а не к месяцу:
 * при нескольких месяцах блок показывается только под первым календарём — иначе N копий правят одно значение.
 */
export function withoutTimeBlock(bindings: DatePickerCalendarBindings): DatePickerCalendarBindings {
	return { ...bindings, timeConfig: { ...bindings.timeConfig, showTime: false } }
}

/**
 * Общие runtime default values для календарных пропсов date picker.
 */
export const DATE_PICKER_CALENDAR_DEFAULTS = {
	minDate: null,
	maxDate: null,
	disabledDates: () => [],
	disabledWeekdays: () => [],
	disableFrom: null,
	disableTo: null,
	highlights: () => [],
	weekends: null,
	firstDayOfWeek: 1 as const,
	locale: 'ru-RU',
	showTime: false,
	showSeconds: false,
	is24Hour: true,
	showWeekNumber: false,
}
