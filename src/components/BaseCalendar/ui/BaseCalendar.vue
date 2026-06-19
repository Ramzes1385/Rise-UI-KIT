<template>
	<BaseCard
			class="base-calendar"
			:class="[
				variantClass,
				{
					'base-calendar--week-numbers': resolvedProps.showWeekNumber,
					'base-calendar--disabled': resolvedProps.isDisabled,
					'base-calendar--range': resolvedProps.selectionMode === 'range',
				},
			]"
			:custom-class="classes.root"
			:variant="resolvedProps.variant"
			:color="resolvedProps.color"
			:size-scale="resolvedProps.sizeScale"
			:padding="12"
			:style="[sizeScaleStyle, customColorStyle, variantStyle]">
			<div v-if="resolvedProps.showNavigation" class="base-calendar__header" :class="classes.header">
				<slot name="header" :month="currentMonth" :year="currentYear">
					<BaseButton
						variant="ghost"
						class="base-calendar__nav-btn"
						:size-scale="resolvedProps.sizeScale"
						:is-disabled="resolvedProps.isDisabled || !canPrev"
						@click="prevMonth">
						<BaseIcon name="chevron-left" :size-scale="calcIconScale('xs', resolvedProps.sizeScale)" />
					</BaseButton>
					<BaseButton
						variant="ghost"
						class="base-calendar__title-btn"
						:size-scale="resolvedProps.sizeScale"
						:is-disabled="resolvedProps.isDisabled || !resolvedProps.canSwitchView"
						@click="resolvedProps.canSwitchView && switchView()">
						<BaseText tag="span" :weight="UI_FONT_WEIGHT.SEMIBOLD" :size-scale="resolvedProps.sizeScale">{{ headerTitle }}</BaseText>
					</BaseButton>
					<BaseButton
						variant="ghost"
						class="base-calendar__nav-btn"
						:size-scale="resolvedProps.sizeScale"
						:is-disabled="resolvedProps.isDisabled || !canNext"
						@click="nextMonth">
						<BaseIcon name="chevron-right" :size-scale="calcIconScale('xs', resolvedProps.sizeScale)" />
					</BaseButton>
				</slot>
			</div>
			<div v-else class="base-calendar__header base-calendar__header--simple" :class="classes.header">
				<BaseText tag="span" :weight="UI_FONT_WEIGHT.SEMIBOLD" :size-scale="resolvedProps.sizeScale">{{ headerTitle }}</BaseText>
			</div>

		<BaseCalendarDays
			v-if="currentView === 'days'"
			:current-view="currentView"
			:show-week-number="resolvedProps.showWeekNumber"
			:ordered-weekdays="orderedWeekdays"
			:calendar-days="calendarDays"
			:size-scale="resolvedProps.sizeScale"
			:is-disabled="resolvedProps.isDisabled"
			:locale="resolvedProps.locale"
			:classes="classes"
			:is-today="isToday"
			:is-selected="isSelected"
			:is-day-disabled="isDayDisabled"
			:is-weekend="isWeekend"
			:is-in-range="isInRange"
			:get-highlight="getHighlight"
			:get-row-week-number="getRowWeekNumber"
			:is-same-day="isSameDay"
			:day-classes="dayClasses"
			:popover-date="popoverDate"
			:popover-style="popoverStyle"
			:popover-highlights="popoverHighlights"
			:close-popover="closePopover"
			@day-click="handleDayClick">
			<template v-if="$slots.day" #day="slotProps">
				<slot name="day" v-bind="slotProps" />
			</template>
			<template v-if="$slots['date-popover']" #date-popover="slotProps">
				<slot name="date-popover" v-bind="slotProps" />
			</template>
		</BaseCalendarDays>

		<BaseCalendarMonths
			v-if="currentView === 'months'"
			:month-names="monthNames"
			:current-month="currentMonth"
			:is-disabled="resolvedProps.isDisabled"
			:size-scale="resolvedProps.sizeScale"
			:classes="classes"
			@select="selectMonth" />

		<div v-if="currentView === 'years'" class="base-calendar__years" :class="classes.years">
			<BaseButton
				v-for="year in yearRange"
				:key="year"
				variant="outline"
				class="base-calendar__year-btn"
				:class="{ 'base-calendar__year-btn--current': year === currentYear }"
				:size-scale="resolvedProps.sizeScale"
				:is-disabled="resolvedProps.isDisabled"
				@click="selectYear(year)">
				<BaseText tag="span" :size-scale="resolvedProps.sizeScale">{{ year }}</BaseText>
			</BaseButton>
		</div>

		<BaseCalendarTime
			v-if="resolvedProps.showTime"
			:hours="hours"
			:minutes="minutes"
			:seconds="seconds"
			:is24-hour="resolvedProps.is24Hour"
			:show-seconds="resolvedProps.showSeconds"
			:is-am="isAm"
			:is-disabled="resolvedProps.isDisabled"
			:size-scale="resolvedProps.sizeScale"
			:classes="classes"
			@update:hours="hours = $event"
			@update:minutes="minutes = $event"
			@update:seconds="seconds = $event"
			@toggle-am-pm="toggleAmPm"
			@time-change="handleTimeChange" />

		<div v-if="resolvedProps.showTodayButton" class="base-calendar__footer" :class="classes.footer">
			<BaseButton
				variant="ghost"
				:size-scale="calcIconScale('md', resolvedProps.sizeScale)"
				:is-disabled="resolvedProps.isDisabled"
				@click="handleTodayClick">
				<BaseText tag="span" :size-scale="resolvedProps.sizeScale">{{ UI_TEXT.TODAY }}</BaseText>
			</BaseButton>
		</div>
	</BaseCard>
</template>

<script setup lang="ts">
import { BaseButton } from '@components/BaseButton'
import { BaseCard } from '@components/BaseCard'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useBaseComponent } from '@composables/useBaseComponent'
import { useCalendar } from '@composables/useCalendar'
import { useCalendarNavigation } from '@composables/useCalendarNavigation'
import { useCalendarPopover } from '@composables/useCalendarPopover'
import { useCalendarResolvedProps } from '@composables/useCalendarResolvedProps'
import { UI_FONT_WEIGHT, UI_TEXT } from '@constants'
import '../styles/BaseCalendar.style.scss'
import BaseCalendarDays from './BaseCalendarDays.vue'
import BaseCalendarMonths from './BaseCalendarMonths.vue'
import BaseCalendarTime from './BaseCalendarTime.vue'
import type { BaseCalendarEmits, BaseCalendarProps, BaseCalendarSlots } from '../model/BaseCalendar.types'

const props = defineProps<BaseCalendarProps>()
const resolvedProps = useCalendarResolvedProps(props)

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-calendar',
	getVariant: () => resolvedProps.value.variant,
	getSizeScale: () => resolvedProps.value.sizeScale,
	getColor: () => resolvedProps.value.color,
	getClass: () => resolvedProps.value.customClass,
	elementKeys: [
		'root',
		'header',
		'weekdays',
		'grid',
		'dayWrapper',
		'day',
		'popover',
		'months',
		'years',
		'time',
		'footer',
	],
})

const emit = defineEmits<BaseCalendarEmits>()
defineSlots<BaseCalendarSlots>()

const isAm = defineModel<boolean>('isAm', { default: true })

const calendar = useCalendar({
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

const {
	currentMonth,
	currentYear,
	currentView,
	hours,
	minutes,
	seconds,
	monthNames,
	headerTitle,
	orderedWeekdays,
	calendarDays,
	yearRange,
	isToday,
	isSelected,
	isInRange,
	isDayDisabled,
	isWeekend,
	getHighlight,
	getEvents,
	isCurrentMonth,
	isRangeStart,
	isRangeEnd,
	isOutOfRange,
	getRowWeekNumber,
	canPrev,
	canNext,
	prevMonth,
	nextMonth,
	switchView,
	selectMonth,
	selectYear,
	isSameDay,
} = calendar

const {
	popoverDate,
	popoverStyle,
	popoverHighlights,
	closePopover,
	dayClasses,
} = useCalendarPopover({
	getEvents,
	isCurrentMonth,
	isToday,
	isSelected,
	isInRange,
	isWeekend,
	isDayDisabled,
	isRangeStart,
	isRangeEnd,
	isOutOfRange,
})

const { handleDayClick, toggleAmPm, handleTimeChange, handleTodayClick } = useCalendarNavigation({
	calendar,
	popover: {
		popoverDate,
		popoverStyle,
		popoverHighlights,
		closePopover,
		dayClasses,
	},
	getSelectionMode: () => resolvedProps.value.selectionMode,
	getShowTime: () => resolvedProps.value.showTime,
	getIsDisabled: () => resolvedProps.value.isDisabled,
	getShowDatePopover: () => resolvedProps.value.showDatePopover,
	isAm,
	emit,
})
</script>
