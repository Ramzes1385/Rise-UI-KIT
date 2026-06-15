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
			<!-- Заголовок -->
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
						<BaseText tag="span" :weight="600" :size-scale="resolvedProps.sizeScale">{{ headerTitle }}</BaseText>
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
				<BaseText tag="span" :weight="600" :size-scale="resolvedProps.sizeScale">{{ headerTitle }}</BaseText>
			</div>

		<!-- Дни -->
			<template v-if="currentView === 'days'">
				<div class="base-calendar__weekdays" :class="classes.weekdays">
					<span v-if="resolvedProps.showWeekNumber" class="base-calendar__week-num-header">
						<BaseText tag="span" :color="{ text: { base: 'var(--color-text-muted)' } }" :size-scale="resolvedProps.sizeScale"
							>№</BaseText
						>
					</span>
					<span v-for="(name, index) in orderedWeekdays" :key="index" class="base-calendar__weekday">
						<BaseText
							tag="span"
							:weight="600"
							:color="{ text: { base: 'var(--color-text-muted)' } }"
							:size-scale="resolvedProps.sizeScale"
							>{{ name }}</BaseText
						>
					</span>
				</div>
				<div class="base-calendar__grid" :class="classes.grid" role="grid">
				<template v-for="(date, index) in calendarDays" :key="index">
					<span v-if="resolvedProps.showWeekNumber && index % 7 === 0" class="base-calendar__week-num">
						<BaseText tag="span" :color="{ text: { base: 'var(--color-text-muted)' } }" :size-scale="resolvedProps.sizeScale">{{
							getRowWeekNumber(index)
						}}</BaseText>
					</span>
						<div class="base-calendar__day-wrapper" :class="classes.dayWrapper">
							<BaseButton
								variant="ghost"
								class="base-calendar__day"
								:class="[dayClasses(date, !!$slots.day), classes.day]"
								:is-disabled="isDayDisabled(date) || resolvedProps.isDisabled"
								:size-scale="resolvedProps.sizeScale"
								@click="handleDayClick(date)">
							<slot
								name="day"
								:date="date"
								:is-today="isToday(date)"
								:is-selected="isSelected(date)"
								:is-disabled="isDayDisabled(date)"
								:is-weekend="isWeekend(date)"
								:is-in-range="isInRange(date)">
								<BaseText tag="span" :size-scale="resolvedProps.sizeScale">{{ date.getDate() }}</BaseText>
							</slot>
							<span
								v-if="getHighlight(date)"
								class="base-calendar__day-dot"
								:style="{ backgroundColor: getHighlight(date)?.color || 'var(--color-accent)' }" />
						</BaseButton>
						<!-- Popover при клике на дату -->
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
									<BaseText tag="span" class="base-calendar__popover-date" :size-scale="resolvedProps.sizeScale">{{
										formatPopoverDate({ date: popoverDate, locale: resolvedProps.locale })
									}}</BaseText>
								</div>
								<div v-if="popoverHighlights.length > 0" class="base-calendar__popover-highlights">
									<div v-for="(hl, hlIdx) in popoverHighlights" :key="hlIdx" class="base-calendar__popover-highlight">
										<span
											class="base-calendar__popover-highlight-dot"
											:style="{ backgroundColor: hl.color || 'var(--color-accent)' }" />
										<BaseText tag="span" :size-scale="resolvedProps.sizeScale">{{ hl.label || 'Событие' }}</BaseText>
									</div>
								</div>
							</slot>
						</div>
					</div>
				</template>
			</div>
		</template>

		<!-- Месяцы -->
		<div v-if="currentView === 'months'" class="base-calendar__months" :class="classes.months">
			<BaseButton
			v-for="(name, index) in monthNames"
				:key="index"
				variant="outline"
				class="base-calendar__month-btn"
				:class="{ 'base-calendar__month-btn--current': index === currentMonth }"
				:size-scale="resolvedProps.sizeScale"
				:is-disabled="resolvedProps.isDisabled"
				@click="selectMonth(index)">
				<BaseText tag="span" :size-scale="resolvedProps.sizeScale">{{ name }}</BaseText>
			</BaseButton>
		</div>

		<!-- Годы -->
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

		<!-- Время -->
		<div v-if="resolvedProps.showTime" class="base-calendar__time" :class="classes.time">
			<div class="base-calendar__time-field">
				<BaseInput
					v-model="hoursModel"
					class="base-calendar__time-input"
					type="number"
					variant="outline"
					:size-scale="resolvedProps.sizeScale"
					:is-disabled="resolvedProps.isDisabled"
					@change="handleTimeChange" />
				<BaseText tag="span" class="base-calendar__time-sep" :size-scale="resolvedProps.sizeScale">:</BaseText>
				<BaseInput
					v-model="minutesModel"
					class="base-calendar__time-input"
					type="number"
					variant="outline"
					:size-scale="resolvedProps.sizeScale"
					:is-disabled="resolvedProps.isDisabled"
					@change="handleTimeChange" />
				<template v-if="resolvedProps.showSeconds">
					<BaseText tag="span" class="base-calendar__time-sep" :size-scale="resolvedProps.sizeScale">:</BaseText>
					<BaseInput
						v-model="secondsModel"
						class="base-calendar__time-input"
						type="number"
						variant="outline"
						:size-scale="resolvedProps.sizeScale"
						:is-disabled="resolvedProps.isDisabled"
						@change="handleTimeChange" />
				</template>
				<template v-if="!resolvedProps.is24Hour">
					<BaseButton
						variant="outline"
						class="base-calendar__time-ampm"
						:size-scale="resolvedProps.sizeScale"
						:is-disabled="resolvedProps.isDisabled"
						@click="toggleAmPm">
						<BaseText tag="span" :size-scale="resolvedProps.sizeScale">{{ isAm ? 'AM' : 'PM' }}</BaseText>
					</BaseButton>
				</template>
			</div>
		</div>

		<!-- Подвал -->
		<div v-if="resolvedProps.showTodayButton" class="base-calendar__footer" :class="classes.footer">
			<BaseButton
				variant="ghost"
				:size-scale="calcIconScale('md', resolvedProps.sizeScale)"
				:is-disabled="resolvedProps.isDisabled"
				@click="handleTodayClick">
				<BaseText tag="span" :size-scale="resolvedProps.sizeScale">{{ UI_TODAY_TEXT }}</BaseText>
			</BaseButton>
		</div>
	</BaseCard>
</template>

<script setup lang="ts">
import { UI_TODAY_TEXT } from '@constants'
import { BaseButton } from '@components/BaseButton'
import { BaseCard } from '@components/BaseCard'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { BaseText } from '@components/BaseText'
import { useCalendar } from '@composables/useCalendar'
import { useClickOutside } from '@composables/useClickOutside'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
import { formatPopoverDate } from '@utils/dateUtils'
import { computed, getCurrentInstance, ref, watch } from 'vue'
import '../styles/BaseCalendar.style.scss'
import type { BaseCalendarEmits, BaseCalendarProps } from '../model/BaseCalendar.types'

const props = defineProps<BaseCalendarProps>()
const rawProps = getCurrentInstance()?.vnode.props

function toKebabCase(value: string): string {
	return value.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
}

function resolveBooleanPropDefault(
	rawProps: Record<string, unknown> | null | undefined,
	name: string,
	value: boolean | undefined,
	defaultValue: boolean,
): boolean {
	const hasProp = Boolean(
		rawProps &&
			(Object.prototype.hasOwnProperty.call(rawProps, name) ||
				Object.prototype.hasOwnProperty.call(rawProps, toKebabCase(name))),
	)

	return hasProp ? (value ?? defaultValue) : defaultValue
}

const resolvedProps = computed(() => ({
	modelValue: props.modelValue ?? null,
	modelValueEnd: props.modelValueEnd ?? null,
	selectedDates: props.selectedDates ?? [],
	selectionMode: props.selectionMode ?? 'single',
	minDate: props.minDate ?? null,
	maxDate: props.maxDate ?? null,
	disabledDates: props.disabledDates ?? [],
	disabledWeekdays: props.disabledWeekdays ?? [],
	disableFrom: props.disableFrom ?? null,
	disableTo: props.disableTo ?? null,
	highlights: props.highlights ?? [],
	events: props.events ?? [],
	weekends: props.weekends ?? null,
	firstDayOfWeek: props.firstDayOfWeek ?? 1,
	showTime: props.showTime ?? false,
	showSeconds: props.showSeconds ?? false,
	is24Hour: resolveBooleanPropDefault(rawProps, 'is24Hour', props.is24Hour, true),
	showWeekNumber: props.showWeekNumber ?? false,
	locale: props.locale ?? 'ru-RU',
	variant: props.variant ?? 'default',
	color: props.color,
	showDatePopover: props.showDatePopover ?? false,
	sizeScale: props.sizeScale ?? 100,
	isDisabled: props.isDisabled ?? false,
	showNavigation: resolveBooleanPropDefault(rawProps, 'showNavigation', props.showNavigation, true),
	canSwitchView: resolveBooleanPropDefault(rawProps, 'canSwitchView', props.canSwitchView, true),
	showTodayButton: resolveBooleanPropDefault(rawProps, 'showTodayButton', props.showTodayButton, true),
	showYear: resolveBooleanPropDefault(rawProps, 'showYear', props.showYear, true),
	initialMonth: props.initialMonth,
	initialYear: props.initialYear,
	customClass: props.customClass,
}))

const { variantClass, variantStyle } = useVariant({ block: 'base-calendar', getVariant: () => resolvedProps.value.variant })
const { sizeScaleStyle } = useSizeScale({ getScale: () => resolvedProps.value.sizeScale })
const { customColorStyle } = useCustomColor({ getColor: () => resolvedProps.value.color })

const { classes } = useCustomClass({
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
	weekends: () => resolvedProps.value.weekends,
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
	goToToday,
	switchView,
	selectMonth,
	selectYear,
	setSingleValue,
	setRangeStart,
	setRangeEnd,
	toggleMultipleDate,
	buildDateWithTime,
	isSameDay,
} = calendar

/** Эмит изменения месяца */
watch(currentMonth, newMonth => {
	emit('month-change', newMonth)
})

/** Эмит изменения года */
watch(currentYear, newYear => {
	emit('year-change', newYear)
})

/** Эмит изменения вида */
watch(currentView, newView => {
	emit('view-change', newView)
})

/** Конвертация 24h→12h для отображения */
function to12h(h: number): number {
	if (h === 0) return 12
	if (h > 12) return h - 12
	return h
}

/** Конвертация 12h→24h с учётом AM/PM */
function from12h(h: number, am: boolean): number {
	if (am) return h === 12 ? 0 : h
	return h === 12 ? 12 : h + 12
}

/** Двусторонние модели для BaseInput (string ↔ number) */
const hoursModel = computed({
	get: (): string => {
		const hour = hours.value
		return String(resolvedProps.value.is24Hour ? hour : to12h(hour))
	},
	set: (val: string): void => {
		const parsed = parseInt(val, 10) || 0
		hours.value = resolvedProps.value.is24Hour ? parsed : from12h(parsed, isAm.value)
	},
})

const minutesModel = computed({
	get: (): string => String(minutes.value),
	set: (val: string): void => {
		minutes.value = parseInt(val, 10) || 0
	},
})

const secondsModel = computed({
	get: (): string => String(seconds.value),
	set: (val: string): void => {
		seconds.value = parseInt(val, 10) || 0
	},
})

/** Состояние popover для даты */
const popoverDate = ref<Date | null>(null)
const popoverStyle = ref<Record<string, string>>({})
const popoverRef = ref<HTMLElement | null>(null)

/** Highlights для текущего popover */
const popoverHighlights = computed(() => {
	if (!popoverDate.value) return []
	return getEvents(popoverDate.value)
})

/** Закрыть popover */
function closePopover(): void {
	popoverDate.value = null
}

/** Закрытие popover по клику вне */
useClickOutside({
	targets: [popoverRef],
	callback: closePopover,
	isActive: () => !!popoverDate.value,
	isCapture: true,
})

/** CSS-классы для ячейки дня */
function dayClasses(date: Date, isCustomSlot: boolean): Record<string, boolean> {
	const isCurrent = isCurrentMonth(date)
	return {
		'base-calendar__day--other': !isCurrent,
		'base-calendar__day--today': isToday(date),
		'base-calendar__day--selected': isCurrent && isSelected(date),
		'base-calendar__day--range': isCurrent && isInRange(date),
		'base-calendar__day--weekend': isWeekend(date),
		'base-calendar__day--disabled': isDayDisabled(date),
		'base-calendar__day--start': isCurrent && isRangeStart(date),
		'base-calendar__day--end': isCurrent && isRangeEnd(date),
		'base-calendar__day--out-of-range': isCurrent && isOutOfRange(date),
		'base-calendar__day--custom': isCustomSlot,
	}
}

/** Обработка клика по дню */
function handleDayClick(date: Date): void {
	if (isDayDisabled(date) || resolvedProps.value.isDisabled) return

	emit('date-click', date)

	if (resolvedProps.value.showDatePopover || getEvents(date).length > 0) {
		popoverDate.value = popoverDate.value && isSameDay(popoverDate.value, date) ? null : date
		popoverStyle.value = {
			top: '100%',
			left: '50%',
			transform: 'translateX(-50%)',
		}
	}

	if (resolvedProps.value.selectionMode === 'single') {
		handleSingleClick(date)
		return
	}

	if (resolvedProps.value.selectionMode === 'range') {
		handleRangeClick(date)
		return
	}

	handleMultipleClick(date)
}

/** Выбор одной даты */
function handleSingleClick(date: Date): void {
	const result = resolvedProps.value.showTime ? buildDateWithTime(date) : date
	setSingleValue(result)
	emit('update:modelValue', result)
}

/** Выбор диапазона */
function handleRangeClick(date: Date): void {
	const start = calendar.internalValue.value
	const end = calendar.internalValueEnd.value

	if (!start || (start && end)) {
		setRangeStart(date)
		setRangeEnd(null)
		emit('update:modelValue', date)
		emit('update:modelValueEnd', null)
	} else {
		if (date < start) {
			setRangeStart(date)
			setRangeEnd(start)
			emit('update:modelValue', date)
			emit('update:modelValueEnd', start)
		} else {
			setRangeEnd(date)
			emit('update:modelValueEnd', date)
		}
		emit('range-select', calendar.internalValue.value!, calendar.internalValueEnd.value!)
	}
}

/** Множественный выбор */
function handleMultipleClick(date: Date): void {
	toggleMultipleDate(date)
	emit('update:selectedDates', [...calendar.internalSelectedDates.value])
}

/** Переключить AM/PM с корректировкой часов */
function toggleAmPm(): void {
	const currentHour = hours.value
	if (isAm.value) {
		hours.value = currentHour < 12 ? currentHour + 12 : currentHour
	} else {
		hours.value = currentHour >= 12 ? currentHour - 12 : currentHour
	}
	isAm.value = !isAm.value
	handleTimeChange()
}

/** Обновить время */
function handleTimeChange(): void {
	if (!calendar.internalValue.value) return
	const result = buildDateWithTime(calendar.internalValue.value)
	setSingleValue(result)
	emit('update:modelValue', result)
}

/** Клик по «Сегодня» */
function handleTodayClick(): void {
	goToToday()
	const now = new Date()
	setSingleValue(now)
	emit('update:modelValue', now)
	emit('date-click', now)
}
</script>
