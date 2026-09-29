<template>
	<div class="base-calendar__weekdays" :class="classes.weekdays">
		<span v-if="showWeekNumber" class="base-calendar__week-num-header">№</span>
		<span v-for="(name, index) in orderedWeekdays" :key="index" class="base-calendar__weekday">{{ name }}</span>
	</div>
	<div class="base-calendar__grid" :class="classes.grid">
		<template v-for="cell in cells" :key="cell.key">
			<span v-if="cell.weekNumber !== null" class="base-calendar__week-num">{{ cell.weekNumber }}</span>
			<div class="base-calendar__day-wrapper" :class="classes.dayWrapper">
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
import { UI_CALENDAR } from '@/locales/messages'
import { formatPopoverDate } from '@utils/data/dateUtils'
import { useBaseCalendarDays } from '../model/useBaseCalendarDays'
import type { BaseCalendarDaysEmits, BaseCalendarDaysProps, BaseCalendarDaysSlots } from '../types/BaseCalendarDays.types'

const props = defineProps<BaseCalendarDaysProps>()

const emit = defineEmits<BaseCalendarDaysEmits>()

defineSlots<BaseCalendarDaysSlots>()

const { popoverRef, hasDaySlot, cells } = useBaseCalendarDays(props)
</script>
