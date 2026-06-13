import type { CalendarHighlight, CalendarWeekday, CalendarWeekends } from '@components/BaseCalendar'

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

function toKebabCase(value: string): string {
	return value.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
}

function hasRuntimeProp(rawProps: Record<string, unknown> | null | undefined, name: string): boolean {
	return Boolean(
		rawProps &&
			(Object.prototype.hasOwnProperty.call(rawProps, name) ||
				Object.prototype.hasOwnProperty.call(rawProps, toKebabCase(name))),
	)
}

export function resolveBooleanPropDefault(
	rawProps: Record<string, unknown> | null | undefined,
	name: string,
	value: boolean | undefined,
	defaultValue: boolean,
): boolean {
	const hasProp = hasRuntimeProp(rawProps, name)

	return hasProp ? (value ?? defaultValue) : defaultValue
}

function applyExplicitCalendarProp<Key extends keyof BaseDatePickerCalendarProps>(
	target: BaseDatePickerCalendarProps,
	source: BaseDatePickerCalendarProps,
	rawProps: Record<string, unknown> | null | undefined,
	name: Key,
): void {
	if (!hasRuntimeProp(rawProps, name)) return
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
	rawProps: Record<string, unknown> | null | undefined,
	config?: BaseDatePickerCalendarProps,
): BaseDatePickerCalendarConfig {
	const merged: BaseDatePickerCalendarProps = { ...(config ?? {}) }

	applyExplicitCalendarProp(merged, source, rawProps, 'minDate')
	applyExplicitCalendarProp(merged, source, rawProps, 'maxDate')
	applyExplicitCalendarProp(merged, source, rawProps, 'disabledDates')
	applyExplicitCalendarProp(merged, source, rawProps, 'disabledWeekdays')
	applyExplicitCalendarProp(merged, source, rawProps, 'disableFrom')
	applyExplicitCalendarProp(merged, source, rawProps, 'disableTo')
	applyExplicitCalendarProp(merged, source, rawProps, 'highlights')
	applyExplicitCalendarProp(merged, source, rawProps, 'weekends')
	applyExplicitCalendarProp(merged, source, rawProps, 'firstDayOfWeek')
	applyExplicitCalendarProp(merged, source, rawProps, 'locale')
	applyExplicitCalendarProp(merged, source, rawProps, 'showTime')
	applyExplicitCalendarProp(merged, source, rawProps, 'showSeconds')
	applyExplicitCalendarProp(merged, source, rawProps, 'is24Hour')
	applyExplicitCalendarProp(merged, source, rawProps, 'showWeekNumber')

	return pickDatePickerCalendarConfig(merged)
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
