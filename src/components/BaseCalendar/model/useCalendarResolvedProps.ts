import { computed } from 'vue'
import { useExplicitPropDetection } from '@composables/useExplicitPropDetection'
import type { BaseCalendarProps } from './BaseCalendar.types'
import type { ComputedRef } from 'vue'

export interface ResolvedCalendarProps {
	modelValue: Date | null
	modelValueEnd: Date | null
	selectedDates: Date[]
	selectionMode: NonNullable<BaseCalendarProps['selectionMode']>
	minDate: Date | null
	maxDate: Date | null
	disabledDates: Date[]
	disabledWeekdays: NonNullable<BaseCalendarProps['disabledWeekdays']>
	disableFrom: Date | null
	disableTo: Date | null
	highlights: NonNullable<BaseCalendarProps['highlights']>
	events: NonNullable<BaseCalendarProps['events']>
	weekends: BaseCalendarProps['weekends']
	firstDayOfWeek: NonNullable<BaseCalendarProps['firstDayOfWeek']>
	showTime: boolean
	showSeconds: boolean
	is24Hour: boolean
	showWeekNumber: boolean
	locale: string
	variant: NonNullable<BaseCalendarProps['variant']>
	color: BaseCalendarProps['color']
	showDatePopover: boolean
	sizeScale: number
	isDisabled: boolean
	showNavigation: boolean
	canSwitchView: boolean
	showTodayButton: boolean
	showYear: boolean
	initialMonth: BaseCalendarProps['initialMonth']
	initialYear: BaseCalendarProps['initialYear']
	customClass: BaseCalendarProps['customClass']
}

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
