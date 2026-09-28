/** Composable: логика BaseCalendarDays — ячейки сетки дней с доступными именами и закрытие подсказки дня */
import { computed, ref, useSlots } from 'vue'
import { useClickOutside } from '@composables/useClickOutside'
import type { BaseCalendarDaysProps } from '../types/BaseCalendarDays.types'

/** Выравнивание popover по колонке: слева направо от ячейки, справа — налево, в середине — по центру */
function popoverClassFor(column: number): string | undefined {
	if (column < 3) return 'base-calendar__popover--start'
	if (column > 3) return 'base-calendar__popover--end'
	return undefined
}

function dayCell(props: BaseCalendarDaysProps, day: { date: Date; index: number; hasDaySlot: boolean; labelFormat: Intl.DateTimeFormat }) {
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
		// Выбранный день, концы и дни внутри диапазона — «нажатые» кнопки (только в текущем месяце, как и подсветка)
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
	// Слот day заменяет содержимое ячейки: тогда имя кнопки даёт содержимое слота, а не полная дата
	const hasDaySlot = computed((): boolean => !!slots.day)
	// Полная дата для доступного имени дня: один форматтер на локаль, а не toLocaleDateString на каждую ячейку
	const labelFormat = computed(
		() => new Intl.DateTimeFormat(props.locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
	)

	return {
		popoverRef,
		hasDaySlot,
		// Состояние ячеек считается один раз на перерисовку, а не отдельными вызовами из шаблона
		cells: computed(() =>
			props.calendarDays.map((date, index) =>
				dayCell(props, { date, index, hasDaySlot: hasDaySlot.value, labelFormat: labelFormat.value }),
			),
		),
	}
}
