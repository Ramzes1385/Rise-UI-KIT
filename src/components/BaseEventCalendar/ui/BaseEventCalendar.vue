<template>
	<div
		ref="rootRef"
		:class="[
			ui('root'),
			variantClass,
			classes.root,
			`base-event-calendar--${currentView}`,
			{ 'base-event-calendar--selectable': isSelectable },
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="region"
		:aria-label="text.CALENDAR">
		<slot name="toolbar" v-bind="toolbarProps">
			<div :class="[ui('toolbar'), classes.toolbar]">
				<div :class="ui('nav')">
					<BaseButton variant="outline" :size-scale="sizeScale" @click="today">{{ text.TODAY }}</BaseButton>
					<BaseButton variant="ghost" :size-scale="sizeScale" :aria-label="text.PREV" @click="prev">
						<BaseIcon name="chevron-left" />
					</BaseButton>
					<BaseButton variant="ghost" :size-scale="sizeScale" :aria-label="text.NEXT" @click="next">
						<BaseIcon name="chevron-right" />
					</BaseButton>
				</div>
				<div :class="ui('title')">{{ title }}</div>
				<BaseSegmented
					v-if="viewOptions.length > 1"
					:class="ui('views')"
					:model-value="currentView"
					:options="viewOptions"
					:aria-label="text.VIEWS"
					:size-scale="sizeScale"
					@update:model-value="handleViewChange" />
			</div>
		</slot>
		<div class="base-event-calendar__status" role="status">{{ status }}</div>
		<span v-if="isSelectable" :id="selectHintId" hidden>{{ text.SELECT_HINT }}</span>
		<span v-if="isEditable" :id="editHintId" hidden>{{ text.EDIT_HINT }}</span>

		<div :class="ui('view')">
			<Transition v-bind="viewTransition">
				<div
					v-if="currentView === 'month'"
					:key="viewKey"
					ref="gridRef"
					:class="ui('month')"
					role="grid"
					:aria-label="title"
					:aria-multiselectable="isSelectable || undefined"
					:aria-describedby="isSelectable ? selectHintId : undefined"
					@keydown="handleGridKeydown"
					@pointerdown="handleMonthPointerDown">
					<div :class="ui('weekdays')" role="row">
						<div v-for="name in weekdays" :key="name" :class="ui('weekday')" role="columnheader">{{ name }}</div>
					</div>
					<div
						v-for="week in weeks"
						:key="week.key"
						:class="ui('week')"
						role="row"
						:style="{ '--lanes': week.lanes, '--more': week.hasMore ? 1 : 0 }">
						<div
							v-for="day in week.days"
							:key="day.key"
							:class="dayClass(day)"
							role="gridcell"
							:data-day="day.key"
							:tabindex="day.key === focusedKey ? 0 : -1"
							:aria-label="day.label"
							:aria-selected="day.key === focusedKey || isDaySelected(day)"
							:aria-current="day.isToday ? 'date' : undefined"
							@focus="handleDayFocus(day)">
							<span :class="ui('day-number')" aria-hidden="true">
								<slot v-if="daySlot(day)" :name="daySlot(day)!" v-bind="daySlotProps(day)" />
								<template v-else>{{ day.date.getDate() }}</template>
							</span>
							<div :class="ui('lanes')">
								<button
									v-for="segment in segmentsOf(week, day.column)"
									:key="segment.item.key"
									type="button"
									:class="barClass(segment, true)"
									:style="[eventStyle(segment.item), { '--lane': segment.lane, '--span': segment.span }]"
									:tabindex="isSegmentFocusable(segment, week) ? 0 : -1"
									:aria-label="eventLabel(segment.item)"
									:aria-describedby="isEditable ? editHintId : undefined"
									:data-event-key="segment.item.key"
									@click="handleEventClick(segment.item)"
									@pointerdown="handleEventPointerDown($event, segment.item, 'month')"
									@keydown="handleEventKeydown($event, segment.item, 'month')"
									@focusout="handleEventFocusout">
									<slot
										v-if="eventSlot(segment.item)"
										:name="eventSlot(segment.item)!"
										v-bind="eventSlotProps(segment.item)" />
									<template v-else>
										<span v-if="eventStart(segment.item)" :class="ui('event-time')">{{
											eventStart(segment.item)
										}}</span>
										<span :class="ui('event-title')">{{ segment.item.event.title }}</span>
									</template>
									<span v-if="canResizeBar(segment)" class="base-event-calendar__resize" aria-hidden="true"></span>
								</button>
								<BasePopover
									v-if="day.hidden"
									:class="ui('more')"
									:is-open="openDay === day.key"
									:size-scale="sizeScale"
									@update:is-open="setMoreOpen(day, $event)">
									<template #trigger>
										<button
											type="button"
											:class="ui('more-button')"
											:tabindex="day.key === focusedKey ? 0 : -1"
											:aria-label="moreLabel(day)">
											{{ moreText(day) }}
										</button>
									</template>
									<div :class="ui('popover')">
										<p :class="ui('popover-title')">{{ formatFullDate(day.date) }}</p>
										<button
											v-for="item in dayEvents(day)"
											:key="item.key"
											type="button"
											:class="itemClass()"
											:style="eventStyle(item)"
											:aria-label="eventLabel(item)"
											@click="handleEventClick(item)">
											<slot v-if="eventSlot(item)" :name="eventSlot(item)!" v-bind="eventSlotProps(item)" />
											<template v-else>
												<span v-if="eventStart(item)" :class="ui('event-time')">{{ eventStart(item) }}</span>
												<span :class="ui('event-title')">{{ item.event.title }}</span>
											</template>
										</button>
									</div>
								</BasePopover>
							</div>
						</div>
					</div>
				</div>

				<div v-else-if="currentView === 'list'" :key="viewKey" :class="ui('list')">
					<template v-if="agenda.length">
						<div v-for="day in agenda" :key="day.date.getTime()" :class="ui('agenda-day')">
							<div :class="ui('agenda-date')" aria-hidden="true">{{ formatFullDate(day.date) }}</div>
							<ul :class="ui('agenda-items')" :aria-label="formatFullDate(day.date)">
								<li v-for="item in day.items" :key="item.key">
									<button
										type="button"
										:class="itemClass()"
										:style="eventStyle(item)"
										:aria-label="eventLabel(item)"
										@click="handleEventClick(item)">
										<slot v-if="eventSlot(item)" :name="eventSlot(item)!" v-bind="eventSlotProps(item)" />
										<template v-else>
											<span :class="ui('event-time')">{{ eventTime(item) || text.ALL_DAY }}</span>
											<span :class="ui('event-title')">{{ item.event.title }}</span>
										</template>
									</button>
								</li>
							</ul>
						</div>
					</template>
					<div v-else :class="ui('empty')">
						<slot name="empty">{{ text.EMPTY }}</slot>
					</div>
				</div>

				<div v-else :key="viewKey" :class="ui('time-grid')" :style="{ '--days': timeDays.length, '--all-day-lanes': allDayLanes }">
					<div v-if="resourceHeaders.length" :class="ui('resource-head')">
						<div class="base-event-calendar__corner"></div>
						<div
							v-for="header in resourceHeaders"
							:key="header.key"
							:class="ui('resource')"
							:style="{ '--span': header.days.length }">
							<slot v-if="resourceSlot(header)" :name="resourceSlot(header)!" v-bind="resourceSlotProps(header)" />
							<template v-else>{{ header.resource.title }}</template>
						</div>
					</div>
					<div :class="ui('time-head')">
						<div class="base-event-calendar__corner"></div>
						<div v-for="day in timeDays" :key="day.key" :class="headerDayClass(day)">
							<slot name="header-day" :date="day.date" :label="day.label" :is-today="day.isToday">{{ day.label }}</slot>
						</div>
					</div>
					<div :class="ui('all-day')">
						<div :class="ui('all-day-label')">
							<slot name="all-day">{{ text.ALL_DAY }}</slot>
						</div>
						<div :class="ui('all-day-events')">
							<button
								v-for="segment in allDaySegments"
								:key="segment.item.key"
								type="button"
								:class="barClass(segment, false)"
								:style="[eventStyle(segment.item), allDayStyle(segment)]"
								:aria-label="eventLabel(segment.item)"
								:aria-describedby="isEditable ? editHintId : undefined"
								:data-event-key="segment.item.key"
								@click="handleEventClick(segment.item)"
								@pointerdown="handleEventPointerDown($event, segment.item, 'all-day')"
								@keydown="handleEventKeydown($event, segment.item, 'all-day')"
								@focusout="handleEventFocusout">
								<slot
									v-if="eventSlot(segment.item)"
									:name="eventSlot(segment.item)!"
									v-bind="eventSlotProps(segment.item)" />
								<span v-else :class="ui('event-title')">{{ segment.item.event.title }}</span>
								<span v-if="canResizeBar(segment)" class="base-event-calendar__resize" aria-hidden="true"></span>
							</button>
						</div>
					</div>
					<div ref="scrollRef" :class="ui('time-body')" @scroll="handleTimeScroll">
						<div
							class="base-event-calendar__time-canvas"
							:style="{ '--slots': timeSlots.length }"
							@pointerdown="handleTimePointerDown">
							<div :class="ui('axis')" aria-hidden="true">
								<div v-for="slot in timeSlots" :key="slot.key" :class="ui('axis-slot')">
									<slot v-if="slot.isHour" name="time-slot" :time="slot.time" :label="slot.label">{{ slot.label }}</slot>
								</div>
							</div>
							<div
								v-for="day in timeDays"
								:key="day.key"
								:class="columnClass(day, Boolean(workHours))"
								role="group"
								:data-day="day.dayKey"
								:data-column="day.key"
								:data-resource="day.resource ? day.resource.id : undefined"
								:tabindex="isSelectable ? (isColumnFocusable(day, focusedKey) ? 0 : -1) : undefined"
								:aria-label="day.name"
								:aria-describedby="isSelectable ? selectHintId : undefined"
								@keydown="handleColumnKeydown($event, day)"
								@focus="handleColumnFocus(day)"
								@blur="handleColumnBlur">
								<div v-if="day.work" class="base-event-calendar__work" :style="workStyle(day.work)"></div>
								<div v-if="selectionStyle(day)" class="base-event-calendar__selection" :style="selectionStyle(day)!"></div>
								<div v-if="cursorStyle(day)" class="base-event-calendar__cursor" :style="cursorStyle(day)!"></div>
								<div v-if="hasNowLine(day)" :class="ui('now')" :style="nowStyle">
									<span class="base-event-calendar__now-label">{{ text.NOW }}</span>
								</div>
								<button
									v-for="segment in day.segments"
									:key="segment.item.key"
									type="button"
									:class="blockClass(segment)"
									:style="[eventStyle(segment.item), timedStyle(segment)]"
									:aria-label="eventLabel(segment.item)"
									:aria-describedby="isEditable ? editHintId : undefined"
									:data-event-key="segment.item.key"
									@click="handleEventClick(segment.item)"
									@pointerdown="handleEventPointerDown($event, segment.item, 'time')"
									@keydown="handleEventKeydown($event, segment.item, 'time')"
									@focusout="handleEventFocusout">
									<slot
										v-if="eventSlot(segment.item)"
										:name="eventSlot(segment.item)!"
										v-bind="eventSlotProps(segment.item)" />
									<template v-else>
										<span :class="ui('event-title')">{{ segment.item.event.title }}</span>
										<span :class="ui('event-time')">{{ timedTime(segment) }}</span>
									</template>
									<span v-if="canResizeBlock(segment)" class="base-event-calendar__resize" aria-hidden="true"></span>
								</button>
							</div>
						</div>
					</div>
				</div>
			</Transition>
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
		isSelectable: false,
		isEditable: false,
		canMove: undefined,
		resources: () => [],
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
	resourceHeaders,
	resourceSlot,
	resourceSlotProps,
	isColumnFocusable,
	allDaySegments,
	allDayLanes,
	allDayStyle,
	timedStyle,
	workStyle,
	nowStyle,
	timedTime,
	hasNowLine,
	eventLabel,
	eventTime,
	eventStart,
	eventStyle,
	eventSlot,
	eventSlotProps,
	daySlot,
	daySlotProps,
	handleEventClick,
	rootRef,
	selectHintId,
	isDaySelected,
	handleMonthPointerDown,
	handleTimePointerDown,
	handleColumnKeydown,
	handleColumnFocus,
	handleColumnBlur,
	selectionStyle,
	cursorStyle,
	editHintId,
	canResizeBar,
	canResizeBlock,
	handleEventPointerDown,
	handleEventKeydown,
	handleEventFocusout,
	ui,
	viewKey,
	viewTransition,
	dayClass,
	headerDayClass,
	columnClass,
	barClass,
	blockClass,
	itemClass,
	handleTimeScroll,
} = useBaseEventCalendar(props, emit)
</script>
