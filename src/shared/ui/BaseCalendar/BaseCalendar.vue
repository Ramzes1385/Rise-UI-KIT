<template>
	<BaseCard
		class="base-calendar"
		:class="[`base-calendar--${size}`, { 'base-calendar--week-numbers': showWeekNumber }]"
		:size-scale="sizeScale">
		<!-- Заголовок -->
		<div class="base-calendar__header">
			<slot name="header" :month="currentMonth" :year="currentYear">
				<BaseButton variant="ghost" class="base-calendar__nav-btn" :size-scale="sizeScale" @click="prevMonth">
					<BaseIcon name="chevron-left" size="xs" :size-scale="sizeScale" />
				</BaseButton>
				<BaseButton variant="ghost" class="base-calendar__title-btn" :size-scale="sizeScale" @click="switchView">
					<BaseText tag="span" :weight="600" :size-scale="sizeScale">{{ headerTitle }}</BaseText>
				</BaseButton>
				<BaseButton variant="ghost" class="base-calendar__nav-btn" :size-scale="sizeScale" @click="nextMonth">
					<BaseIcon name="chevron-right" size="xs" :size-scale="sizeScale" />
				</BaseButton>
			</slot>
		</div>

		<!-- Дни -->
		<template v-if="currentView === 'days'">
			<div class="base-calendar__weekdays">
				<span v-if="showWeekNumber" class="base-calendar__week-num-header">
					<BaseText tag="span" :color="{ text: { base: 'var(--color-text-muted)' } }" :size-scale="sizeScale"
						>№</BaseText
					>
				</span>
				<span v-for="(name, idx) in orderedWeekdays" :key="idx" class="base-calendar__weekday">
					<BaseText
						tag="span"
						:weight="600"
						:color="{ text: { base: 'var(--color-text-muted)' } }"
						:size-scale="sizeScale"
						>{{ name }}</BaseText
					>
				</span>
			</div>
			<div class="base-calendar__grid">
				<template v-for="(date, idx) in calendarDays" :key="idx">
					<span v-if="showWeekNumber && idx % 7 === 0" class="base-calendar__week-num">
						<BaseText tag="span" :color="{ text: { base: 'var(--color-text-muted)' } }" :size-scale="sizeScale">{{
							getWeekNumber(date)
						}}</BaseText>
					</span>
					<div class="base-calendar__day-wrapper">
						<BaseButton
							variant="ghost"
							class="base-calendar__day"
							:class="dayClasses(date)"
							:is-disabled="isDisabled(date)"
							:size-scale="sizeScale"
							@click="handleDayClick(date)">
							<slot
								name="day"
								:date="date"
								:is-today="isToday(date)"
								:is-selected="isSelected(date)"
								:is-disabled="isDisabled(date)"
								:is-weekend="isWeekend(date)"
								:is-in-range="isInRange(date)">
								<BaseText tag="span" :size-scale="sizeScale">{{ date.getDate() }}</BaseText>
							</slot>
							<span
								v-if="getHighlight(date)"
								class="base-calendar__day-dot"
								:style="{ backgroundColor: getHighlight(date)?.color || 'var(--color-accent)' }" />
						</BaseButton>
						<!-- Popover при клике на дату -->
						<div
							v-if="showDatePopover && popoverDate && isSameDay(date, popoverDate)"
							class="base-calendar__popover"
							:style="popoverStyle"
							@click.stop>
							<div class="base-calendar__popover-arrow" />
							<slot name="date-popover" :date="popoverDate" :close="closePopover">
								<div class="base-calendar__popover-content">
									<BaseText tag="span" class="base-calendar__popover-date" :size-scale="sizeScale">{{
										formatPopoverDate(popoverDate)
									}}</BaseText>
								</div>
							</slot>
						</div>
					</div>
				</template>
			</div>
		</template>

		<!-- Месяцы -->
		<div v-if="currentView === 'months'" class="base-calendar__months">
			<BaseButton
				v-for="(name, idx) in monthNames"
				:key="idx"
				variant="outline"
				class="base-calendar__month-btn"
				:class="{ 'base-calendar__month-btn--current': idx === currentMonth }"
				:size-scale="sizeScale"
				@click="selectMonth(idx)">
				<BaseText tag="span" :size-scale="sizeScale">{{ name }}</BaseText>
			</BaseButton>
		</div>

		<!-- Годы -->
		<div v-if="currentView === 'years'" class="base-calendar__years">
			<BaseButton
				v-for="year in yearRange"
				:key="year"
				variant="outline"
				class="base-calendar__year-btn"
				:class="{ 'base-calendar__year-btn--current': year === currentYear }"
				:size-scale="sizeScale"
				@click="selectYear(year)">
				<BaseText tag="span" :size-scale="sizeScale">{{ year }}</BaseText>
			</BaseButton>
		</div>

		<!-- Время -->
		<div v-if="showTime" class="base-calendar__time">
			<div class="base-calendar__time-field">
				<BaseInput
					v-model="hoursModel"
					class="base-calendar__time-input"
					type="number"
					variant="outline"
					size="sm"
					:size-scale="sizeScale"
					@change="handleTimeChange" />
				<BaseText tag="span" class="base-calendar__time-sep" :size-scale="sizeScale">:</BaseText>
				<BaseInput
					v-model="minutesModel"
					class="base-calendar__time-input"
					type="number"
					variant="outline"
					size="sm"
					:size-scale="sizeScale"
					@change="handleTimeChange" />
				<template v-if="showSeconds">
					<BaseText tag="span" class="base-calendar__time-sep" :size-scale="sizeScale">:</BaseText>
					<BaseInput
						v-model="secondsModel"
						class="base-calendar__time-input"
						type="number"
						variant="outline"
						size="sm"
						:size-scale="sizeScale"
						@change="handleTimeChange" />
				</template>
				<template v-if="!is24Hour">
					<BaseButton
						variant="outline"
						size="sm"
						class="base-calendar__time-ampm"
						:size-scale="sizeScale"
						@click="toggleAmPm">
						<BaseText tag="span" :size-scale="sizeScale">{{ isAm ? 'AM' : 'PM' }}</BaseText>
					</BaseButton>
				</template>
			</div>
		</div>

		<!-- Подвал -->
		<div class="base-calendar__footer">
			<BaseButton variant="ghost" size="sm" :size-scale="sizeScale" @click="handleTodayClick">
				<BaseText tag="span" :size-scale="sizeScale">Сегодня</BaseText>
			</BaseButton>
		</div>
	</BaseCard>
</template>

<script setup lang="ts">
import { useClickOutside } from '@/shared/composables/useClickOutside'
import { useVariant } from '@/shared/composables/useVariant'
import { BaseButton } from '@/shared/ui/BaseButton'
import { BaseCard } from '@/shared/ui/BaseCard'
import BaseIcon from '@/shared/ui/BaseIcon/BaseIcon.vue'
import { BaseInput } from '@/shared/ui/BaseInput'
import { BaseText } from '@/shared/ui/BaseText'
import { computed, ref } from 'vue'
import './BaseCalendar.style.scss'
import type { BaseCalendarEmits, BaseCalendarProps } from './BaseCalendar.types'
import { useCalendar } from './useCalendar'

const props = withDefaults(defineProps<BaseCalendarProps>(), {
	selectionMode: 'single',
	variant: 'default',
	minDate: null,
	maxDate: null,
	disabledDates: () => [],
	disabledWeekdays: () => [],
	disableFrom: null,
	disableTo: null,
	highlights: () => [],
	events: () => [],
	weekends: null,
	firstDayOfWeek: 1,
	showTime: false,
	showSeconds: false,
	is24Hour: true,
	showWeekNumber: false,
	locale: 'ru-RU',
	selectedDates: () => [],
	showDatePopover: false,
	sizeScale: 100,
})

const { variantClass } = useVariant({ block: 'base-calendar', getVariant: () => props.variant })

const emit = defineEmits<BaseCalendarEmits>()

const isAm = defineModel<boolean>('isAm', { default: true })

const cal = useCalendar({
	selectionMode: () => props.selectionMode,
	modelValue: () => props.modelValue ?? null,
	modelValueEnd: () => props.modelValueEnd ?? null,
	selectedDates: () => props.selectedDates,
	minDate: () => props.minDate ?? null,
	maxDate: () => props.maxDate ?? null,
	disabledDates: () => props.disabledDates,
	disabledWeekdays: () => props.disabledWeekdays,
	disableFrom: () => props.disableFrom ?? null,
	disableTo: () => props.disableTo ?? null,
	highlights: () => props.highlights,
	weekends: () => props.weekends ?? null,
	firstDayOfWeek: () => props.firstDayOfWeek,
	locale: () => props.locale,
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
	isDisabled,
	isWeekend,
	getHighlight,
	isCurrentMonth,
	getWeekNumber,
	prevMonth,
	nextMonth,
	goToToday,
	switchView,
	selectMonth,
	selectYear,
	buildDateWithTime,
	isSameDay,
} = cal

/** Двусторонние модели для BaseInput (string ↔ number) */
const hoursModel = computed({
	get: (): string => String(hours.value),
	set: (val: string): void => {
		hours.value = parseInt(val, 10) || 0
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

/** Открыть popover для даты */
function handleDayContext(date: Date, event: MouseEvent): void {
	if (!props.showDatePopover) return
	popoverDate.value = date
	popoverStyle.value = {
		top: '100%',
		left: '50%',
		transform: 'translateX(-50%)',
	}
}

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

/** Форматировать дату для popover */
function formatPopoverDate(date: Date): string {
	return date.toLocaleDateString(props.locale, {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		weekday: 'long',
	})
}

/** Дата вне выделенного диапазона */
function isOutOfRange(date: Date): boolean {
	if (props.selectionMode !== 'range') return false
	if (!props.modelValue || !props.modelValueEnd) return false
	return !isSelected(date) && !isInRange(date) && isCurrentMonth(date)
}

/** CSS-классы для ячейки дня */
function dayClasses(date: Date): Record<string, boolean> {
	return {
		'base-calendar__day--other': !isCurrentMonth(date),
		'base-calendar__day--today': isToday(date),
		'base-calendar__day--selected': isSelected(date),
		'base-calendar__day--range': isInRange(date),
		'base-calendar__day--weekend': isWeekend(date),
		'base-calendar__day--disabled': isDisabled(date),
		'base-calendar__day--start': isRangeStart(date),
		'base-calendar__day--end': isRangeEnd(date),
		'base-calendar__day--out-of-range': isOutOfRange(date),
	}
}

function isRangeStart(date: Date): boolean {
	const val = props.modelValue
	return !!val && isSameDay(date, val) && props.selectionMode === 'range'
}

function isRangeEnd(date: Date): boolean {
	const end = props.modelValueEnd
	return !!end && isSameDay(date, end) && props.selectionMode === 'range'
}

/** Обработка клика по дню */
function handleDayClick(date: Date): void {
	if (isDisabled(date)) return

	emit('date-click', date)

	/** Открыть popover при клике */
	if (props.showDatePopover) {
		popoverDate.value = popoverDate.value && isSameDay(popoverDate.value, date) ? null : date
		popoverStyle.value = {
			top: '100%',
			left: '50%',
			transform: 'translateX(-50%)',
		}
	}

	if (props.selectionMode === 'single') {
		const result = props.showTime ? buildDateWithTime(date) : date
		emit('update:modelValue', result)
		return
	}

	if (props.selectionMode === 'range') {
		handleRangeClick(date)
		return
	}

	handleMultipleClick(date)
}

/** Выбор диапазона */
function handleRangeClick(date: Date): void {
	const start = props.modelValue
	const end = props.modelValueEnd

	if (!start || (start && end)) {
		emit('update:modelValue', date)
		emit('update:modelValueEnd', null)
	} else {
		if (date < start) {
			emit('update:modelValue', date)
			emit('update:modelValueEnd', start)
		} else {
			emit('update:modelValueEnd', date)
		}
		if (props.modelValue && (props.modelValueEnd || date >= props.modelValue)) {
			const s = props.modelValue
			const e = date < s ? s : date
			emit('range-select', s, e)
		}
	}
}

/** Множественный выбор */
function handleMultipleClick(date: Date): void {
	const current = [...props.selectedDates]
	const idx = current.findIndex(d => isSameDay(d, date))
	if (idx > -1) {
		current.splice(idx, 1)
	} else {
		current.push(date)
	}
	emit('update:selectedDates', current)
}

/** Переключить AM/PM */
function toggleAmPm(): void {
	isAm.value = !isAm.value
	handleTimeChange()
}

/** Обновить время */
function handleTimeChange(): void {
	if (!props.modelValue) return
	const result = buildDateWithTime(props.modelValue)
	emit('update:modelValue', result)
}

/** Клик по «Сегодня» */
function handleTodayClick(): void {
	goToToday()
	const now = new Date()
	emit('update:modelValue', now)
	emit('date-click', now)
}
</script>
