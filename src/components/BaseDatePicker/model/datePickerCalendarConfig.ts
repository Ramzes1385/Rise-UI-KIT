import { getLocale } from '@/locales/state'
import type { CalendarWeekday } from '@components/BaseCalendar'
import type {
	BaseDatePickerCalendarConfig,
	BaseDatePickerCalendarProps,
	DatePickerCalendarBindings,
	DatePickerCalendarDisplay,
} from '../types/BaseDatePickerCalendar.types'

/** Пропсы календаря, которые перекрывают `config`, если переданы явно */
const EXPLICIT_CALENDAR_PROPS = [
	'minDate',
	'maxDate',
	'disabledDates',
	'disabledWeekdays',
	'disableFrom',
	'disableTo',
	'highlights',
	'weekends',
	'firstDayOfWeek',
	'locale',
	'showTime',
	'showSeconds',
	'is24Hour',
	'showWeekNumber',
] as const satisfies readonly (keyof BaseDatePickerCalendarProps)[]

function copyCalendarProp<Key extends keyof BaseDatePickerCalendarProps>(
	target: BaseDatePickerCalendarProps,
	source: BaseDatePickerCalendarProps,
	name: Key,
): void {
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
		// Первый день недели и формат дат — из языка кита (setLocale), если не заданы пропсами
		firstDayOfWeek: source.firstDayOfWeek ?? (getLocale().firstDayOfWeek as CalendarWeekday),
		locale: source.locale ?? getLocale().intl,
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

	for (const name of EXPLICIT_CALENDAR_PROPS) {
		if (wasPropPassed(name)) copyCalendarProp(merged, source, name)
	}

	return pickDatePickerCalendarConfig(merged)
}

/**
 * Преобразует плоскую конфигурацию date picker в props BaseCalendar.
 * С 1.2.2 BaseCalendar принимает ограничения, время и отображение только группами
 * (constraints/timeConfig/displayConfig): плоские ключи уходили бы в $attrs и молча игнорировались.
 * Навигация и смена вида календаря отключены — их выполняет шапка панели.
 */
export function toBaseCalendarProps(config: BaseDatePickerCalendarConfig, display: DatePickerCalendarDisplay): DatePickerCalendarBindings {
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
