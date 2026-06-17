<template>
	<template v-if="currentView === 'days'">
		<div class="base-calendar__weekdays" :class="classes.weekdays">
			<span v-if="showWeekNumber" class="base-calendar__week-num-header">
				<BaseText tag="span" :color="{ text: { base: 'var(--color-text-muted)' } }" :size-scale="sizeScale"
					>№</BaseText
				>
			</span>
			<span v-for="(name, index) in orderedWeekdays" :key="index" class="base-calendar__weekday">
				<BaseText
					tag="span"
					:weight="UI_FONT_WEIGHT.SEMIBOLD"
					:color="{ text: { base: 'var(--color-text-muted)' } }"
					:size-scale="sizeScale"
					>{{ name }}</BaseText
				>
			</span>
		</div>
		<div class="base-calendar__grid" :class="classes.grid" role="grid">
			<template v-for="(date, index) in calendarDays" :key="index">
				<span v-if="showWeekNumber && index % 7 === 0" class="base-calendar__week-num">
					<BaseText tag="span" :color="{ text: { base: 'var(--color-text-muted)' } }" :size-scale="sizeScale">{{
						getRowWeekNumber(index)
					}}</BaseText>
				</span>
				<div class="base-calendar__day-wrapper" :class="classes.dayWrapper">
					<BaseButton
						variant="ghost"
						class="base-calendar__day"
						:class="[dayClasses(date, !!$slots.day), classes.day]"
						:is-disabled="isDayDisabled(date) || isDisabled"
						:size-scale="sizeScale"
						@click="emit('dayClick', date)">
						<slot
							name="day"
							:date="date"
							:is-today="isToday(date)"
							:is-selected="isSelected(date)"
							:is-disabled="isDayDisabled(date)"
							:is-weekend="isWeekend(date)"
							:is-in-range="isInRange(date)">
							<BaseText tag="span" :size-scale="sizeScale">{{ date.getDate() }}</BaseText>
						</slot>
						<span
							v-if="getHighlight(date)"
							class="base-calendar__day-dot"
							:style="{ backgroundColor: getHighlight(date)?.color || 'var(--color-accent)' }" />
					</BaseButton>
					<div
						v-if="popoverDate && isSameDay(date, popoverDate)"
						ref="popoverRef"
						class="base-calendar__popover"
						:class="classes.popover"
						:style="popoverStyle"
						@mousedown.stop
						@click.stop>
						<div class="base-calendar__popover-arrow" />
						<slot name="date-popover" :date="popoverDate" :close="closePopover" :highlights="popoverHighlights">
							<div class="base-calendar__popover-content">
								<BaseText tag="span" class="base-calendar__popover-date" :size-scale="sizeScale">{{
									formatPopoverDate({ date: popoverDate, locale })
								}}</BaseText>
							</div>
							<div v-if="popoverHighlights.length > 0" class="base-calendar__popover-highlights">
								<div v-for="(hl, hlIdx) in popoverHighlights" :key="hlIdx" class="base-calendar__popover-highlight">
									<span
										class="base-calendar__popover-highlight-dot"
										:style="{ backgroundColor: hl.color || 'var(--color-accent)' }" />
									<BaseText tag="span" :size-scale="sizeScale">{{ hl.label || UI_CALENDAR_EVENT_TEXT }}</BaseText>
								</div>
							</div>
						</slot>
					</div>
				</div>
			</template>
		</div>
	</template>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { BaseText } from '@components/BaseText'
import { useClickOutside } from '@composables/useClickOutside'
import { UI_CALENDAR_EVENT_TEXT, UI_FONT_WEIGHT } from '@constants'
import { formatPopoverDate } from '@utils/dateUtils'
import type { BaseCalendarDaysEmits, BaseCalendarDaysProps, BaseCalendarDaysSlots } from '../model/BaseCalendarDays.types'

const props = defineProps<BaseCalendarDaysProps>()

const popoverRef = ref<HTMLElement | null>(null)

useClickOutside({
	targets: [popoverRef],
	callback: () => props.closePopover(),
	isActive: () => !!props.popoverDate,
	isCapture: true,
})

const emit = defineEmits<BaseCalendarDaysEmits>()

defineSlots<BaseCalendarDaysSlots>()
</script>
