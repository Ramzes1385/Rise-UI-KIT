import { computed, ref, useSlots } from 'vue'
import { useCalendarUi } from './useCalendarUi'
import { hideLeaving } from './useCalendarMotion'
import { createDateFormat } from '@utils/data/dateFormatUtils'
import type { DateFormatter } from '@utils/data/dateFormatUtils'
import { useClickOutside } from '@composables/overlay/useClickOutside'
import type { BaseCalendarDaysProps } from '../types/BaseCalendarDays.types'

function popoverClassFor(column: number): string | undefined {
	if (column < 3) return 'base-calendar__popover--start'
	if (column > 3) return 'base-calendar__popover--end'
	return undefined
}

function dayCell(props: BaseCalendarDaysProps, day: { date: Date; index: number; hasDaySlot: boolean; labelFormat: DateFormatter }) {
	const { date, index } = day
	const dayClassMap = props.dayClasses(date, day.hasDaySlot)
	const highlight = props.getHighlight(date)
	const label = day.labelFormat.format(date)
	return {
		key: index,
		date,
		popoverClass: popoverClassFor(index % 7),
		classes: dayClassMap,
		weekNumber: props.showWeekNumber && index % 7 === 0 ? props.getRowWeekNumber(index) : null,
		isToday: props.isToday(date),
		isDisabled: props.isDayDisabled(date),
		isPressed: !!(dayClassMap['base-calendar__day--selected'] || dayClassMap['base-calendar__day--range']),
		highlight,
		label: highlight?.label ? `${label}, ${highlight.label}` : label,
	}
}

export function useBaseCalendarDays(props: BaseCalendarDaysProps) {
	const slots = useSlots()
	const popoverRef = ref<HTMLElement | null>(null)
	useClickOutside({
		targets: [popoverRef],
		callback: () => props.closePopover(),
		isActive: () => !!props.popoverDate,
		isCapture: true,
	})
	const hasDaySlot = computed((): boolean => !!slots.day)
	const labelFormat = computed(() => createDateFormat(props.locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))

	return {
		ui: useCalendarUi(),
		hideLeaving,
		popoverRef,
		hasDaySlot,
		cells: computed(() =>
			props.calendarDays.map((date, index) =>
				dayCell(props, { date, index, hasDaySlot: hasDaySlot.value, labelFormat: labelFormat.value }),
			),
		),
	}
}
