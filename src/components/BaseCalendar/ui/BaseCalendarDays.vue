<template>
	<div :class="ui('days')">
		<div :class="[ui('weekdays'), classes.weekdays]">
			<span v-if="showWeekNumber" :class="ui('week-num-header')">№</span>
			<span v-for="(name, index) in orderedWeekdays" :key="index" :class="ui('weekday')">{{ name }}</span>
		</div>
		<Transition :name="slideName" :css="isAnimated" @before-leave="hideLeaving">
			<div :key="period" :class="[ui('grid'), classes.grid]">
				<template v-for="cell in cells" :key="cell.key">
					<span v-if="cell.weekNumber !== null" :class="ui('week-num')">{{ cell.weekNumber }}</span>
					<div :class="[ui('day-wrapper'), classes.dayWrapper]">
						<button
							type="button"
							:class="[ui('day'), cell.classes, classes.day]"
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
								:class="ui('day-dot')"
								:style="{ '--calendar-dot-color': cell.highlight.color }"
								aria-hidden="true" />
						</button>
						<div
							v-if="popoverDate && isSameDay(cell.date, popoverDate)"
							ref="popoverRef"
							:class="[ui('popover'), cell.popoverClass, classes.popover]"
							@mousedown.stop
							@click.stop>
							<div :class="ui('popover-arrow')" />
							<slot name="date-popover" :date="popoverDate" :close="closePopover" :highlights="popoverHighlights">
								<span :class="ui('popover-date')">{{ formatPopoverDate({ date: popoverDate, locale }) }}</span>
								<ul v-if="popoverHighlights.length > 0" :class="ui('popover-highlights')">
									<li v-for="(hl, hlIdx) in popoverHighlights" :key="hlIdx" :class="ui('popover-highlight')">
										<span
											:class="ui('popover-highlight-dot')"
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
		</Transition>
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

const { ui, hideLeaving, popoverRef, hasDaySlot, cells } = useBaseCalendarDays(props)
</script>
