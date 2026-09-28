import { computed } from 'vue'
import type { Ref } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { useCalendar } from '@composables/useCalendar'
import { isolateFormField } from '@composables/useFormContext'
import { useBaseComponent } from '@composables/useBaseComponent'
import { useCalendarPopover } from '@composables/useCalendarPopover'
import { useCalendarInteraction } from '@composables/useCalendarInteraction'
import { useCalendarResolvedProps } from '@composables/useCalendarResolvedProps'
import type { BaseCalendarEmits, BaseCalendarProps } from '../types/BaseCalendar.types'

const CALENDAR_ELEMENTS = ['root', 'header', 'weekdays', 'grid', 'dayWrapper', 'day', 'popover', 'months', 'years', 'time', 'footer']

function useCalendarState(resolvedProps: ReturnType<typeof useCalendarResolvedProps>) {
	return useCalendar({
		selectionMode: () => resolvedProps.value.selectionMode,
		modelValue: () => resolvedProps.value.modelValue,
		modelValueEnd: () => resolvedProps.value.modelValueEnd,
		selectedDates: () => resolvedProps.value.selectedDates,
		minDate: () => resolvedProps.value.minDate,
		maxDate: () => resolvedProps.value.maxDate,
		disabledDates: () => resolvedProps.value.disabledDates,
		disabledWeekdays: () => resolvedProps.value.disabledWeekdays,
		disableFrom: () => resolvedProps.value.disableFrom,
		disableTo: () => resolvedProps.value.disableTo,
		highlights: () => resolvedProps.value.highlights,
		weekends: () => resolvedProps.value.weekends ?? null,
		firstDayOfWeek: () => resolvedProps.value.firstDayOfWeek,
		locale: () => resolvedProps.value.locale,
		initialMonth: () => resolvedProps.value.initialMonth,
		initialYear: () => resolvedProps.value.initialYear,
		showYear: () => resolvedProps.value.showYear,
	})
}

function usePopoverState(calendar: ReturnType<typeof useCalendar>) {
	return useCalendarPopover({
		getEvents: calendar.getEvents,
		isCurrentMonth: calendar.isCurrentMonth,
		isToday: calendar.isToday,
		isSelected: calendar.isSelected,
		isInRange: calendar.isInRange,
		isWeekend: calendar.isWeekend,
		isDayDisabled: calendar.isDayDisabled,
		isRangeStart: calendar.isRangeStart,
		isRangeEnd: calendar.isRangeEnd,
		isOutOfRange: calendar.isOutOfRange,
	})
}

function useInteraction(
	resolvedProps: ReturnType<typeof useCalendarResolvedProps>,
	calendar: ReturnType<typeof useCalendar>,
	context: { popover: ReturnType<typeof useCalendarPopover>; isAm: Ref<boolean>; emit: BaseCalendarEmits },
) {
	const { popoverDate, popoverStyle, popoverHighlights, closePopover, dayClasses } = context.popover
	return useCalendarInteraction({
		calendar,
		popover: { popoverDate, popoverStyle, popoverHighlights, closePopover, dayClasses },
		getSelectionMode: () => resolvedProps.value.selectionMode,
		getShowTime: () => resolvedProps.value.showTime,
		getIsDisabled: () => resolvedProps.value.isDisabled,
		getShowDatePopover: () => resolvedProps.value.showDatePopover,
		isAm: context.isAm,
		emit: context.emit,
	})
}

function navLabelsFor(view: string): { prev: string; next: string } {
	if (view === 'months') return { prev: UI_ARIA.PREV_YEAR, next: UI_ARIA.NEXT_YEAR }
	if (view === 'years') return { prev: UI_ARIA.PREV_YEARS, next: UI_ARIA.NEXT_YEARS }
	return { prev: UI_ARIA.PREV_MONTH, next: UI_ARIA.NEXT_MONTH }
}

export function useBaseCalendar(props: BaseCalendarProps, emit: BaseCalendarEmits, isAm: Ref<boolean>) {
	isolateFormField()
	const resolvedProps = useCalendarResolvedProps(props)
	const standard = useBaseComponent({
		block: 'base-calendar',
		getVariant: () => resolvedProps.value.variant,
		getSizeScale: () => resolvedProps.value.sizeScale,
		getColor: () => resolvedProps.value.color,
		getClass: () => resolvedProps.value.customClass,
		elementKeys: CALENDAR_ELEMENTS,
	})
	const calendar = useCalendarState(resolvedProps)
	const popover = usePopoverState(calendar)

	return {
		...standard,
		resolvedProps,
		calendar,
		...calendar,
		...popover,
		...useInteraction(resolvedProps, calendar, { popover, isAm, emit }),
		isRangeComplete: computed(
			(): boolean =>
				resolvedProps.value.selectionMode === 'range' && !!calendar.internalValue.value && !!calendar.internalValueEnd.value,
		),
		navLabels: computed(() => navLabelsFor(calendar.currentView.value)),
	}
}
