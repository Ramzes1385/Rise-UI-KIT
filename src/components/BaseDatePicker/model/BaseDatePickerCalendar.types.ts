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
