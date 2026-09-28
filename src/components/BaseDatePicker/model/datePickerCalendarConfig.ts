import { getLocale } from '@/locales/state'
import type { CalendarWeekday } from '@components/BaseCalendar'
import type {
	BaseDatePickerCalendarConfig,
	BaseDatePickerCalendarProps,
	DatePickerCalendarBindings,
	DatePickerCalendarDisplay,
} from '../types/BaseDatePickerCalendar.types'

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

function calendarDefaults(): BaseDatePickerCalendarConfig {
	const kitLocale = getLocale()
	return {
		minDate: null,
		maxDate: null,
		disabledDates: [],
		disabledWeekdays: [],
		disableFrom: null,
		disableTo: null,
		highlights: [],
		weekends: null,
		firstDayOfWeek: kitLocale.firstDayOfWeek as CalendarWeekday,
		locale: kitLocale.intl,
		showTime: false,
		showSeconds: false,
		is24Hour: true,
		showWeekNumber: false,
	}
}

function assignDefined<Key extends keyof BaseDatePickerCalendarConfig>(
	target: BaseDatePickerCalendarConfig,
	source: BaseDatePickerCalendarProps,
	name: Key,
): void {
	const value = source[name]
	if (value !== undefined && value !== null) target[name] = value as BaseDatePickerCalendarConfig[Key]
}

export function pickDatePickerCalendarConfig(source: BaseDatePickerCalendarProps): BaseDatePickerCalendarConfig {
	const config = calendarDefaults()
	for (const name of EXPLICIT_CALENDAR_PROPS) assignDefined(config, source, name)
	return config
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

export function withoutTimeBlock(bindings: DatePickerCalendarBindings): DatePickerCalendarBindings {
	return { ...bindings, timeConfig: { ...bindings.timeConfig, showTime: false } }
}
