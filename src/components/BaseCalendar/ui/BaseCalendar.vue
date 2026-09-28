<template>
	<BaseCard
		class="base-calendar"
		:class="[
			variantClass,
			{
				'base-calendar--week-numbers': resolvedProps.showWeekNumber,
				'base-calendar--disabled': resolvedProps.isDisabled,
				'base-calendar--range': resolvedProps.selectionMode === 'range',
				'base-calendar--range-complete': isRangeComplete,
			},
		]"
		:custom-class="classes.root"
		:variant="resolvedProps.variant"
		:size-scale="resolvedProps.sizeScale"
		:aria-disabled="resolvedProps.isDisabled ? 'true' : undefined"
		:style="[sizeScaleStyle, customColorStyle, variantStyle]">
		<div v-if="resolvedProps.showNavigation" class="base-calendar__header" :class="classes.header">
			<slot name="header" :month="currentMonth" :year="currentYear">
				<BaseButton
					variant="ghost"
					class="base-calendar__nav-btn"
					:aria-label="navLabels.prev"
					:size-scale="resolvedProps.sizeScale"
					:is-disabled="resolvedProps.isDisabled || !canPrev"
					@click="prevMonth">
					<BaseIcon name="chevron-left" :size-scale="calcIconScale('md', resolvedProps.sizeScale)" />
				</BaseButton>
				<!-- Заголовок — кнопка смены вида (дни → месяцы → годы) или просто текст, если смена вида выключена -->
				<BaseButton
					v-if="resolvedProps.canSwitchView"
					variant="ghost"
					class="base-calendar__title-btn"
					:size-scale="resolvedProps.sizeScale"
					:is-disabled="resolvedProps.isDisabled"
					@click="switchView">
					<span class="base-calendar__title">{{ headerTitle }}</span>
				</BaseButton>
				<span v-else class="base-calendar__title">{{ headerTitle }}</span>
				<BaseButton
					variant="ghost"
					class="base-calendar__nav-btn"
					:aria-label="navLabels.next"
					:size-scale="resolvedProps.sizeScale"
					:is-disabled="resolvedProps.isDisabled || !canNext"
					@click="nextMonth">
					<BaseIcon name="chevron-right" :size-scale="calcIconScale('md', resolvedProps.sizeScale)" />
				</BaseButton>
			</slot>
		</div>
		<div v-else class="base-calendar__header base-calendar__header--simple" :class="classes.header">
			<span class="base-calendar__title">{{ headerTitle }}</span>
		</div>

		<BaseCalendarDays
			v-if="currentView === 'days'"
			:show-week-number="resolvedProps.showWeekNumber"
			:ordered-weekdays="orderedWeekdays"
			:calendar-days="calendarDays"
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
			:classes="classes"
			@select="selectMonth" />

		<div v-if="currentView === 'years'" class="base-calendar__years" :class="classes.years">
			<button
				v-for="year in yearRange"
				:key="year"
				type="button"
				class="base-calendar__year-btn"
				:class="{ 'base-calendar__year-btn--current': year === currentYear }"
				:aria-current="year === currentYear ? 'true' : undefined"
				:disabled="resolvedProps.isDisabled"
				@click="selectYear(year)">
				{{ year }}
			</button>
		</div>

		<BaseCalendarTime
			v-if="resolvedProps.showTime"
			:hours="hours"
			:minutes="minutes"
			:seconds="seconds"
			:is24-hour="resolvedProps.is24Hour"
			:show-seconds="resolvedProps.showSeconds"
			:is-am="isAmResolved"
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
				class="base-calendar__today-btn"
				:size-scale="resolvedProps.sizeScale"
				:is-disabled="resolvedProps.isDisabled"
				@click="handleTodayClick">
				{{ UI_TEXT.TODAY }}
			</BaseButton>
		</div>
	</BaseCard>
</template>

<script setup lang="ts">
import '@components/BaseCard/styles/BaseCard.style.scss'
import '../styles/BaseCalendar.style.scss'
import { UI_TEXT } from '@/locales/messages'
import { BaseCard } from '@components/BaseCard'
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/iconUtils'
import { BaseButton } from '@components/BaseButton'
import BaseCalendarDays from './BaseCalendarDays.vue'
import BaseCalendarTime from './BaseCalendarTime.vue'
import BaseCalendarMonths from './BaseCalendarMonths.vue'
import { useBaseCalendar } from '../model/useBaseCalendar'
import type { BaseCalendarEmits, BaseCalendarProps, BaseCalendarSlots } from '../types/BaseCalendar.types'

// Дефолты резолвятся в useCalendarResolvedProps, а не через withDefaults:
// 1) boolean-пропы с дефолтом true требуют wasPropPassed (?? не работает для false ?? true)
// 2) вложенные config-объекты (timeConfig, displayConfig, constraints) дают тройной приоритет
// См. useCalendarResolvedProps — единый источник дефолтов.
const props = defineProps<BaseCalendarProps>()

const emit = defineEmits<BaseCalendarEmits>()
defineSlots<BaseCalendarSlots>()

const isAm = defineModel<boolean>('isAm', { default: true })

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	resolvedProps,
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
	getRowWeekNumber,
	canPrev,
	canNext,
	prevMonth,
	nextMonth,
	switchView,
	selectMonth,
	selectYear,
	isSameDay,
	popoverDate,
	popoverHighlights,
	closePopover,
	dayClasses,
	isAmResolved,
	handleDayClick,
	toggleAmPm,
	handleTimeChange,
	handleTodayClick,
	isRangeComplete,
	navLabels,
} = useBaseCalendar(props, emit, isAm)
</script>
