/** Composable: вычисление нормализованных пропсов календаря с дефолтами и поддержкой constraints/timeConfig/displayConfig */
import { computed } from 'vue'
import type { ResolvedCalendarProps } from './useCalendarResolvedProps.types'
import type { BaseCalendarProps } from '@components/BaseCalendar/model/BaseCalendar.types'
import type { ComputedRef } from 'vue'

/** Описание: вычисляет нормализованные пропсы календаря с дефолтами и поддержкой constraints/timeConfig/displayConfig, возвращает computed-объект */
function useCalendarResolvedProps(props: BaseCalendarProps): ComputedRef<ResolvedCalendarProps> {
	return computed(() => ({
		modelValue: props.modelValue ?? null,
		modelValueEnd: props.modelValueEnd ?? null,
		selectedDates: props.selectedDates ?? [],
		selectionMode: props.selectionMode ?? 'single',
		minDate: props.constraints?.minDate ?? null,
		maxDate: props.constraints?.maxDate ?? null,
		disabledDates: props.constraints?.disabledDates ?? [],
		disabledWeekdays: props.constraints?.disabledWeekdays ?? [],
		disableFrom: props.constraints?.disableFrom ?? null,
		disableTo: props.constraints?.disableTo ?? null,
		highlights: props.highlights ?? [],
		events: props.events ?? [],
		weekends: props.weekends ?? null,
		firstDayOfWeek: props.firstDayOfWeek ?? 1,
		showTime: props.timeConfig?.showTime ?? false,
		showSeconds: props.timeConfig?.showSeconds ?? false,
		is24Hour: props.timeConfig?.is24Hour ?? true,
		showWeekNumber: props.displayConfig?.showWeekNumber ?? false,
		locale: props.locale ?? 'ru-RU',
		variant: props.variant ?? 'default',
		color: props.color,
		showDatePopover: props.showDatePopover ?? false,
		sizeScale: props.sizeScale ?? 100,
		isDisabled: props.isDisabled ?? false,
		showNavigation: props.displayConfig?.showNavigation ?? true,
		canSwitchView: props.displayConfig?.canSwitchView ?? true,
		showTodayButton: props.displayConfig?.showTodayButton ?? true,
		showYear: props.displayConfig?.showYear ?? true,
		initialMonth: props.initialMonth,
		initialYear: props.initialYear,
		customClass: props.customClass,
	}))
}

export { useCalendarResolvedProps }
export type { ResolvedCalendarProps }
