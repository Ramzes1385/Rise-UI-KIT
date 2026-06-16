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
					:weight="UI_FONT_WEIGHT_SEMIBOLD"
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
import { BaseButton } from '@components/BaseButton'
import { BaseText } from '@components/BaseText'
import { useClickOutside } from '@composables/useClickOutside'
import { UI_CALENDAR_EVENT_TEXT, UI_FONT_WEIGHT_SEMIBOLD } from '@constants'
import { formatPopoverDate } from '@utils/dateUtils'
import { ref } from 'vue'
import type { CalendarHighlight, CalendarView } from '../model/BaseCalendar.types'

const props = defineProps<{
	currentView: CalendarView
	showWeekNumber: boolean
	orderedWeekdays: string[]
	calendarDays: Date[]
	sizeScale: number
	isDisabled: boolean
	locale: string
	classes: Record<string, string>
	isToday: (date: Date) => boolean
	isSelected: (date: Date) => boolean
	isDayDisabled: (date: Date) => boolean
	isWeekend: (date: Date) => boolean
	isInRange: (date: Date) => boolean
	getHighlight: (date: Date) => { color?: string } | undefined
	getRowWeekNumber: (index: number) => number
	isSameDay: (a: Date, b: Date) => boolean
	dayClasses: (date: Date, isCustomSlot: boolean) => Record<string, boolean>
	popoverDate: Date | null
	popoverStyle: Record<string, string>
	popoverHighlights: CalendarHighlight[]
	closePopover: () => void
}>()

const popoverRef = ref<HTMLElement | null>(null)

useClickOutside({
	targets: [popoverRef],
	callback: () => props.closePopover(),
	isActive: () => !!props.popoverDate,
	isCapture: true,
})

const emit = defineEmits<{
	dayClick: [date: Date]
}>()

defineSlots<{
	day(props: {
		date: Date
		isToday: boolean
		isSelected: boolean
		isDisabled: boolean
		isWeekend: boolean
		isInRange: boolean
	}): unknown
	'date-popover'(props: { date: Date; close: () => void; highlights: CalendarHighlight[] }): unknown
}>()
</script>
