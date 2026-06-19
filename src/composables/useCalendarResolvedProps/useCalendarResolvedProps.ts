import { computed } from 'vue'
import { useExplicitPropDetection } from '@composables/useExplicitPropDetection'
import type { ResolvedCalendarProps } from './useCalendarResolvedProps.types'
import type { BaseCalendarProps } from '@components/BaseCalendar/model/BaseCalendar.types'
import type { ComputedRef } from 'vue'

/** Описание: вычисляет нормализованные пропсы календаря с дефолтами и поддержкой constraints/timeConfig/displayConfig, возвращает computed-объект */
function useCalendarResolvedProps(props: BaseCalendarProps): ComputedRef<ResolvedCalendarProps> {
	const { resolveBooleanPropDefault } = useExplicitPropDetection()

	return computed(() => ({
		modelValue: props.modelValue ?? null,
		modelValueEnd: props.modelValueEnd ?? null,
		selectedDates: props.selectedDates ?? [],
		selectionMode: props.selectionMode ?? 'single',
		minDate: props.constraints?.minDate ?? props.minDate ?? null,
		maxDate: props.constraints?.maxDate ?? props.maxDate ?? null,
		disabledDates: props.constraints?.disabledDates ?? props.disabledDates ?? [],
		disabledWeekdays: props.constraints?.disabledWeekdays ?? props.disabledWeekdays ?? [],
		disableFrom: props.constraints?.disableFrom ?? props.disableFrom ?? null,
		disableTo: props.constraints?.disableTo ?? props.disableTo ?? null,
		highlights: props.highlights ?? [],
		events: props.events ?? [],
		weekends: props.weekends ?? null,
		firstDayOfWeek: props.firstDayOfWeek ?? 1,
		showTime: props.timeConfig?.showTime ?? props.showTime ?? false,
		showSeconds: props.timeConfig?.showSeconds ?? props.showSeconds ?? false,
		is24Hour: props.timeConfig?.is24Hour !== undefined
			? props.timeConfig.is24Hour
			: resolveBooleanPropDefault('is24Hour', props.is24Hour, true),
		showWeekNumber: props.displayConfig?.showWeekNumber ?? props.showWeekNumber ?? false,
		locale: props.locale ?? 'ru-RU',
		variant: props.variant ?? 'default',
		color: props.color,
		showDatePopover: props.showDatePopover ?? false,
		sizeScale: props.sizeScale ?? 100,
		isDisabled: props.isDisabled ?? false,
		showNavigation: props.displayConfig?.showNavigation !== undefined
			? props.displayConfig.showNavigation
			: resolveBooleanPropDefault('showNavigation', props.showNavigation, true),
		canSwitchView: props.displayConfig?.canSwitchView !== undefined
			? props.displayConfig.canSwitchView
			: resolveBooleanPropDefault('canSwitchView', props.canSwitchView, true),
		showTodayButton: props.displayConfig?.showTodayButton !== undefined
			? props.displayConfig.showTodayButton
			: resolveBooleanPropDefault('showTodayButton', props.showTodayButton, true),
		showYear: props.displayConfig?.showYear !== undefined
			? props.displayConfig.showYear
			: resolveBooleanPropDefault('showYear', props.showYear, true),
		initialMonth: props.initialMonth,
		initialYear: props.initialYear,
		customClass: props.customClass,
	}))
}

export { useCalendarResolvedProps }
export type { ResolvedCalendarProps }
