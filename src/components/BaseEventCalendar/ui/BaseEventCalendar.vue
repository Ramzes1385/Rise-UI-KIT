<template>
	<div
		class="base-event-calendar"
		:class="[variantClass, classes.root, `base-event-calendar--${currentView}`]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="region"
		:aria-label="text.CALENDAR">
		<slot name="toolbar" v-bind="toolbarProps">
			<div class="base-event-calendar__toolbar" :class="classes.toolbar">
				<div class="base-event-calendar__nav">
					<BaseButton variant="outline" :size-scale="sizeScale" @click="today">{{ text.TODAY }}</BaseButton>
					<BaseButton variant="ghost" :size-scale="sizeScale" :aria-label="text.PREV" @click="prev">
						<BaseIcon name="chevron-left" />
					</BaseButton>
					<BaseButton variant="ghost" :size-scale="sizeScale" :aria-label="text.NEXT" @click="next">
						<BaseIcon name="chevron-right" />
					</BaseButton>
				</div>
				<div class="base-event-calendar__title">{{ title }}</div>
				<BaseSegmented
					v-if="viewOptions.length > 1"
					class="base-event-calendar__views"
					:model-value="currentView"
					:options="viewOptions"
					:aria-label="text.VIEWS"
					:size-scale="sizeScale"
					@update:model-value="handleViewChange" />
			</div>
		</slot>
		<div class="base-event-calendar__status" role="status">{{ status }}</div>

		<div
			v-if="currentView === 'month'"
			ref="gridRef"
			class="base-event-calendar__month"
			role="grid"
			:aria-label="title"
			@keydown="handleGridKeydown">
			<div class="base-event-calendar__weekdays" role="row">
				<div v-for="name in weekdays" :key="name" class="base-event-calendar__weekday" role="columnheader">{{ name }}</div>
			</div>
			<div
				v-for="week in weeks"
				:key="week.key"
				class="base-event-calendar__week"
				role="row"
				:style="{ '--lanes': week.lanes, '--more': week.hasMore ? 1 : 0 }">
				<div
					v-for="day in week.days"
					:key="day.key"
					class="base-event-calendar__day"
					:class="{ 'base-event-calendar__day--today': day.isToday, 'base-event-calendar__day--outside': day.isOutside }"
					role="gridcell"
					:data-day="day.key"
					:tabindex="day.key === focusedKey ? 0 : -1"
					:aria-label="day.label"
					:aria-selected="day.key === focusedKey"
					:aria-current="day.isToday ? 'date' : undefined"
					@focus="handleDayFocus(day)">
					<span class="base-event-calendar__day-number" aria-hidden="true">
						<slot v-if="daySlot(day)" :name="daySlot(day)!" v-bind="daySlotProps(day)" />
						<template v-else>{{ day.date.getDate() }}</template>
					</span>
					<div class="base-event-calendar__lanes">
						<button
							v-for="segment in segmentsOf(week, day.column)"
							:key="segment.item.key"
							type="button"
							class="base-event-calendar__event base-event-calendar__event--bar"
							:class="[
								classes.event,
								{
									'base-event-calendar__event--timed': !segment.item.allDay && segment.span === 1,
									'base-event-calendar__event--continued': !segment.isStart,
									'base-event-calendar__event--continuing': !segment.isEnd,
								},
							]"
							:style="[eventStyle(segment.item), { '--lane': segment.lane, '--span': segment.span }]"
							:tabindex="isSegmentFocusable(segment, week) ? 0 : -1"
							:aria-label="eventLabel(segment.item)"
							@click="handleEventClick(segment.item)">
							<slot v-if="eventSlot(segment.item)" :name="eventSlot(segment.item)!" v-bind="eventSlotProps(segment.item)" />
							<template v-else>
								<span v-if="eventStart(segment.item)" class="base-event-calendar__event-time">{{
									eventStart(segment.item)
								}}</span>
								<span class="base-event-calendar__event-title">{{ segment.item.event.title }}</span>
							</template>
						</button>
						<BasePopover
							v-if="day.hidden"
							class="base-event-calendar__more"
							:is-open="openDay === day.key"
							:size-scale="sizeScale"
							@update:is-open="setMoreOpen(day, $event)">
							<template #trigger>
								<button
									type="button"
									class="base-event-calendar__more-button"
									:tabindex="day.key === focusedKey ? 0 : -1"
									:aria-label="moreLabel(day)">
									{{ moreText(day) }}
								</button>
							</template>
							<div class="base-event-calendar__popover">
								<p class="base-event-calendar__popover-title">{{ formatFullDate(day.date) }}</p>
								<button
									v-for="item in dayEvents(day)"
									:key="item.key"
									type="button"
									class="base-event-calendar__event base-event-calendar__event--item"
									:class="classes.event"
									:style="eventStyle(item)"
									:aria-label="eventLabel(item)"
									@click="handleEventClick(item)">
									<slot v-if="eventSlot(item)" :name="eventSlot(item)!" v-bind="eventSlotProps(item)" />
									<template v-else>
										<span v-if="eventStart(item)" class="base-event-calendar__event-time">{{ eventStart(item) }}</span>
										<span class="base-event-calendar__event-title">{{ item.event.title }}</span>
									</template>
								</button>
							</div>
						</BasePopover>
					</div>
				</div>
			</div>
		</div>

		<div v-else-if="currentView === 'list'" class="base-event-calendar__list">
			<template v-if="agenda.length">
				<div v-for="day in agenda" :key="day.date.getTime()" class="base-event-calendar__agenda-day">
					<div class="base-event-calendar__agenda-date" aria-hidden="true">{{ formatFullDate(day.date) }}</div>
					<ul class="base-event-calendar__agenda-items" :aria-label="formatFullDate(day.date)">
						<li v-for="item in day.items" :key="item.key">
							<button
								type="button"
								class="base-event-calendar__event base-event-calendar__event--item"
								:class="classes.event"
								:style="eventStyle(item)"
								:aria-label="eventLabel(item)"
								@click="handleEventClick(item)">
								<slot v-if="eventSlot(item)" :name="eventSlot(item)!" v-bind="eventSlotProps(item)" />
								<template v-else>
									<span class="base-event-calendar__event-time">{{ eventTime(item) || text.ALL_DAY }}</span>
									<span class="base-event-calendar__event-title">{{ item.event.title }}</span>
								</template>
							</button>
						</li>
					</ul>
				</div>
			</template>
			<div v-else class="base-event-calendar__empty">
				<slot name="empty">{{ text.EMPTY }}</slot>
			</div>
		</div>

		<div v-else class="base-event-calendar__time-grid" :style="{ '--days': timeDays.length, '--all-day-lanes': allDayLanes }">
			<div class="base-event-calendar__time-head">
				<div class="base-event-calendar__corner"></div>
				<div
					v-for="day in timeDays"
					:key="day.key"
					class="base-event-calendar__header-day"
					:class="{ 'base-event-calendar__header-day--today': day.isToday }">
					<slot name="header-day" :date="day.date" :label="day.label" :is-today="day.isToday">{{ day.label }}</slot>
				</div>
			</div>
			<div class="base-event-calendar__all-day">
				<div class="base-event-calendar__all-day-label">
					<slot name="all-day">{{ text.ALL_DAY }}</slot>
				</div>
				<div class="base-event-calendar__all-day-events">
					<button
						v-for="segment in allDaySegments"
						:key="segment.item.key"
						type="button"
						class="base-event-calendar__event base-event-calendar__event--bar"
						:class="[
							classes.event,
							{
								'base-event-calendar__event--continued': !segment.isStart,
								'base-event-calendar__event--continuing': !segment.isEnd,
							},
						]"
						:style="[eventStyle(segment.item), allDayStyle(segment)]"
						:aria-label="eventLabel(segment.item)"
						@click="handleEventClick(segment.item)">
						<slot v-if="eventSlot(segment.item)" :name="eventSlot(segment.item)!" v-bind="eventSlotProps(segment.item)" />
						<span v-else class="base-event-calendar__event-title">{{ segment.item.event.title }}</span>
					</button>
				</div>
			</div>
			<div ref="scrollRef" class="base-event-calendar__time-body">
				<div class="base-event-calendar__time-canvas" :style="{ '--slots': timeSlots.length }">
					<div class="base-event-calendar__axis" aria-hidden="true">
						<div v-for="slot in timeSlots" :key="slot.key" class="base-event-calendar__axis-slot">
							<slot v-if="slot.isHour" name="time-slot" :time="slot.time" :label="slot.label">{{ slot.label }}</slot>
						</div>
					</div>
					<div
						v-for="day in timeDays"
						:key="day.key"
						class="base-event-calendar__column"
						:class="{
							'base-event-calendar__column--today': day.isToday,
							'base-event-calendar__column--work-hours': Boolean(workHours),
						}"
						role="group"
						:aria-label="day.label">
						<div v-if="day.work" class="base-event-calendar__work" :style="workStyle(day.work)"></div>
						<div v-if="hasNowLine(day)" class="base-event-calendar__now" :style="nowStyle">
							<span class="base-event-calendar__now-label">{{ text.NOW }}</span>
						</div>
						<button
							v-for="segment in day.segments"
							:key="segment.item.key"
							type="button"
							class="base-event-calendar__event base-event-calendar__event--block"
							:class="[classes.event, { 'base-event-calendar__event--compact': isCompact(segment) }]"
							:style="[eventStyle(segment.item), timedStyle(segment)]"
							:aria-label="eventLabel(segment.item)"
							@click="handleEventClick(segment.item)">
							<slot v-if="eventSlot(segment.item)" :name="eventSlot(segment.item)!" v-bind="eventSlotProps(segment.item)" />
							<template v-else>
								<span class="base-event-calendar__event-title">{{ segment.item.event.title }}</span>
								<span class="base-event-calendar__event-time">{{ timedTime(segment) }}</span>
							</template>
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseEventCalendar.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { BasePopover } from '@components/BasePopover'
import { BaseSegmented } from '@components/BaseSegmented'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseEventCalendar } from '../model/useBaseEventCalendar'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseEventCalendarEmits, BaseEventCalendarProps, BaseEventCalendarSlots } from '../types/BaseEventCalendar.types'

const props = withDefaults(
	defineProps<BaseEventCalendarProps>(),
	kitDefaults('BaseEventCalendar', {
		variant: DEFAULT_VARIANT,
		events: () => [],
		view: 'month',
		date: undefined,
		views: () => ['month', 'week', 'day', 'list'],
		slotDuration: 30,
		workHours: undefined,
		firstDayOfWeek: undefined,
		maxEventsPerDay: 3,
		hasNowIndicator: true,
		today: undefined,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseEventCalendarEmits>()

defineSlots<BaseEventCalendarSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	text,
	currentView,
	title,
	status,
	today,
	prev,
	next,
	viewOptions,
	handleViewChange,
	toolbarProps,
	gridRef,
	weeks,
	weekdays,
	focusedKey,
	openDay,
	segmentsOf,
	isSegmentFocusable,
	moreText,
	moreLabel,
	setMoreOpen,
	dayEvents,
	handleDayFocus,
	handleGridKeydown,
	agenda,
	formatFullDate,
	scrollRef,
	timeDays,
	timeSlots,
	allDaySegments,
	allDayLanes,
	allDayStyle,
	timedStyle,
	workStyle,
	nowStyle,
	timedTime,
	hasNowLine,
	isCompact,
	eventLabel,
	eventTime,
	eventStart,
	eventStyle,
	eventSlot,
	eventSlotProps,
	daySlot,
	daySlotProps,
	handleEventClick,
} = useBaseEventCalendar(props, emit)
</script>
