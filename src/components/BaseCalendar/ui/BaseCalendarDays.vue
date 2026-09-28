<template>
	<div class="base-calendar__weekdays" :class="classes.weekdays">
		<span v-if="showWeekNumber" class="base-calendar__week-num-header">№</span>
		<span v-for="(name, index) in orderedWeekdays" :key="index" class="base-calendar__weekday">{{ name }}</span>
	</div>
	<div class="base-calendar__grid" :class="classes.grid">
		<template v-for="cell in cells" :key="cell.key">
			<span v-if="cell.weekNumber !== null" class="base-calendar__week-num">{{ cell.weekNumber }}</span>
			<div class="base-calendar__day-wrapper" :class="classes.dayWrapper">
				<!-- Имя кнопки — полная дата («четверг, 15 мая 2025 г.»): одно число без месяца скринридеру ничего не говорит -->
				<button
					type="button"
					class="base-calendar__day"
					:class="[cell.classes, classes.day]"
					:disabled="cell.isDisabled || isDisabled"
					:aria-label="hasDaySlot ? undefined : cell.label"
					:aria-pressed="cell.isPressed"
					:aria-current="cell.isToday ? 'date' : undefined"
					@click="emit('dayClick', cell.date)">
					<slot
						name="day"
						:date="cell.date"
						:is-today="cell.isToday"
						:is-selected="isSelected(cell.date)"
						:is-disabled="cell.isDisabled"
						:is-weekend="isWeekend(cell.date)"
						:is-in-range="isInRange(cell.date)">
						{{ cell.date.getDate() }}
					</slot>
					<span
						v-if="cell.highlight"
						class="base-calendar__day-dot"
						:style="{ '--calendar-dot-color': cell.highlight.color }"
						aria-hidden="true" />
				</button>
				<div
					v-if="popoverDate && isSameDay(cell.date, popoverDate)"
					ref="popoverRef"
					class="base-calendar__popover"
					:class="[cell.popoverClass, classes.popover]"
					@mousedown.stop
					@click.stop>
					<div class="base-calendar__popover-arrow" />
					<slot name="date-popover" :date="popoverDate" :close="closePopover" :highlights="popoverHighlights">
						<span class="base-calendar__popover-date">{{ formatPopoverDate({ date: popoverDate, locale }) }}</span>
						<ul v-if="popoverHighlights.length > 0" class="base-calendar__popover-highlights">
							<li v-for="(hl, hlIdx) in popoverHighlights" :key="hlIdx" class="base-calendar__popover-highlight">
								<span
									class="base-calendar__popover-highlight-dot"
									:style="{ '--calendar-dot-color': hl.color }"
									aria-hidden="true" />
								{{ hl.label || UI_CALENDAR.EVENT_TEXT }}
							</li>
						</ul>
					</slot>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { UI_CALENDAR } from '@/locales/messages'
import { formatPopoverDate } from '@utils/dateUtils'
import { useClickOutside } from '@composables/useClickOutside'
import type { BaseCalendarDaysEmits, BaseCalendarDaysProps, BaseCalendarDaysSlots } from '../types/BaseCalendarDays.types'

const props = defineProps<BaseCalendarDaysProps>()

const emit = defineEmits<BaseCalendarDaysEmits>()

const slots = defineSlots<BaseCalendarDaysSlots>()

const popoverRef = ref<HTMLElement | null>(null)

useClickOutside({
	targets: [popoverRef],
	callback: () => props.closePopover(),
	isActive: () => !!props.popoverDate,
	isCapture: true,
})

/** Слот day заменяет содержимое ячейки: тогда имя кнопки даёт содержимое слота, а не полная дата */
const hasDaySlot = computed((): boolean => !!slots.day)

/** Полная дата для доступного имени дня: один форматтер на локаль, а не toLocaleDateString на каждую ячейку */
const dayLabelFormat = computed(
	() => new Intl.DateTimeFormat(props.locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
)

/** Состояние ячеек сетки: считается один раз на перерисовку, а не отдельными вызовами из шаблона */
/** Выравнивание popover по колонке: слева направо от ячейки, справа — налево, в середине — по центру */
function popoverClassFor(column: number): string | undefined {
	if (column < 3) return 'base-calendar__popover--start'
	if (column > 3) return 'base-calendar__popover--end'
	return undefined
}

const cells = computed(() =>
	props.calendarDays.map((date, index) => {
		const dayClassMap = props.dayClasses(date, hasDaySlot.value)
		const highlight = props.getHighlight(date)
		const label = dayLabelFormat.value.format(date)
		const column = index % 7
		return {
			key: index,
			date,
			popoverClass: popoverClassFor(column),
			classes: dayClassMap,
			weekNumber: props.showWeekNumber && index % 7 === 0 ? props.getRowWeekNumber(index) : null,
			isToday: props.isToday(date),
			isDisabled: props.isDayDisabled(date),
			// Выбранный день, концы и дни внутри диапазона — «нажатые» кнопки (только в текущем месяце, как и подсветка)
			isPressed: !!(dayClassMap['base-calendar__day--selected'] || dayClassMap['base-calendar__day--range']),
			highlight,
			label: highlight?.label ? `${label}, ${highlight.label}` : label,
		}
	}),
)
</script>
