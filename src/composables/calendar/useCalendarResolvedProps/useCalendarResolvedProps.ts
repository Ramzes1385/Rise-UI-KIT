/** Composable: вычисление нормализованных пропсов календаря с дефолтами и поддержкой constraints/timeConfig/displayConfig */
import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { getLocale } from '@/locales/state'
import { resolveFirstDayOfWeek } from '@utils/calendar/weekUtils'
import type { ResolvedCalendarProps } from './types/useCalendarResolvedProps.types'
import type {
	BaseCalendarProps,
	CalendarConstraints,
	CalendarDisplayConfig,
	CalendarTimeConfig,
	CalendarWeekday,
} from '@components/BaseCalendar/types/BaseCalendar.types'

function resolveSelection(props: BaseCalendarProps) {
	return {
		modelValue: props.modelValue ?? null,
		modelValueEnd: props.modelValueEnd ?? null,
		selectedDates: props.selectedDates ?? [],
		selectionMode: props.selectionMode ?? 'single',
		highlights: props.highlights ?? [],
		weekends: props.weekends ?? null,
	}
}

function resolveConstraints(props: BaseCalendarProps) {
	const constraints: CalendarConstraints = props.constraints ?? {}
	return {
		minDate: constraints.minDate ?? null,
		maxDate: constraints.maxDate ?? null,
		disabledDates: constraints.disabledDates ?? [],
		disabledWeekdays: constraints.disabledWeekdays ?? [],
		disableFrom: constraints.disableFrom ?? null,
		disableTo: constraints.disableTo ?? null,
	}
}

function resolveTime(props: BaseCalendarProps) {
	const timeConfig: CalendarTimeConfig = props.timeConfig ?? {}
	return {
		showTime: timeConfig.showTime ?? false,
		showSeconds: timeConfig.showSeconds ?? false,
		is24Hour: timeConfig.is24Hour ?? true,
	}
}

function resolveDisplay(props: BaseCalendarProps) {
	const displayConfig: CalendarDisplayConfig = props.displayConfig ?? {}
	return {
		showWeekNumber: displayConfig.showWeekNumber ?? false,
		showNavigation: displayConfig.showNavigation ?? true,
		canSwitchView: displayConfig.canSwitchView ?? true,
		showTodayButton: displayConfig.showTodayButton ?? true,
		showYear: displayConfig.showYear ?? true,
	}
}

function resolveAppearance(props: BaseCalendarProps) {
	return {
		// Формат дат — из языка кита (setLocale), если не задан пропсом; первый день недели — из явного locale, иначе из языка кита
		firstDayOfWeek: props.firstDayOfWeek ?? (resolveFirstDayOfWeek(props.locale) as CalendarWeekday),
		locale: props.locale ?? getLocale().intl,
		variant: props.variant ?? 'default',
		color: props.color,
		showDatePopover: props.showDatePopover ?? false,
		sizeScale: props.sizeScale ?? 100,
		isDisabled: props.isDisabled ?? false,
		initialMonth: props.initialMonth,
		initialYear: props.initialYear,
		today: props.today,
		customClass: props.customClass,
	}
}

function useCalendarResolvedProps(props: BaseCalendarProps): ComputedRef<ResolvedCalendarProps> {
	return computed(() => ({
		...resolveSelection(props),
		...resolveConstraints(props),
		...resolveTime(props),
		...resolveDisplay(props),
		...resolveAppearance(props),
	}))
}

export { useCalendarResolvedProps }
