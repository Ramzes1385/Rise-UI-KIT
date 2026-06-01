<template>
	<Teleport to="body">
		<Transition name="dropdown">
			<div
				v-if="isOpen"
				ref="panelRef"
				class="date-picker-panel"
				:class="[{ 'date-picker-panel--multi': safeMonthsCount > 1 }, classes.root]"
				:style="panelStyle"
				:data-theme="theme">
				<!-- Общая навигация -->
				<div class="date-picker-panel__header">
					<div class="date-picker-panel__nav-group date-picker-panel__nav-group--prev">
						<BaseButton
							variant="ghost"
							class="date-picker-panel__nav-btn date-picker-panel__nav-btn--double"
							title="Предыдущий год"
							:size-scale="sizeScale"
							@click="handlePrevYear">
							<BaseIcon name="chevron-left" :size-scale="calcIconScale('xs', sizeScale)" />
							<BaseIcon name="chevron-left" :size-scale="calcIconScale('xs', sizeScale)" />
						</BaseButton>
						<BaseButton
							variant="ghost"
							class="date-picker-panel__nav-btn"
							title="Предыдущий месяц"
							:size-scale="sizeScale"
							@click="handlePrevRange">
							<BaseIcon name="chevron-left" :size-scale="calcIconScale('sm', sizeScale)" />
						</BaseButton>
					</div>

					<div class="date-picker-panel__year-title">
						<BaseText tag="span" :weight="700" :size-scale="sizeScale">
							{{ displayYear }}
						</BaseText>
					</div>

					<div class="date-picker-panel__nav-group date-picker-panel__nav-group--next">
						<BaseButton
							variant="ghost"
							class="date-picker-panel__nav-btn"
							title="Следующий месяц"
							:size-scale="sizeScale"
							@click="handleNextRange">
							<BaseIcon name="chevron-right" :size-scale="calcIconScale('sm', sizeScale)" />
						</BaseButton>
						<BaseButton
							variant="ghost"
							class="date-picker-panel__nav-btn date-picker-panel__nav-btn--double"
							title="Следующий год"
							:size-scale="sizeScale"
							@click="handleNextYear">
							<BaseIcon name="chevron-right" :size-scale="calcIconScale('xs', sizeScale)" />
							<BaseIcon name="chevron-right" :size-scale="calcIconScale('xs', sizeScale)" />
						</BaseButton>
					</div>
				</div>

				<BaseCalendar
					v-for="item in monthItems"
					:key="item.key"
					class="date-picker-panel__calendar"
					:show-navigation="false"
					:can-switch-view="false"
					:show-year="safeMonthsCount === 1"
					:show-today-button="safeMonthsCount === 1"
					:model-value="modelValue"
					:model-value-end="modelValueEnd"
					:selected-dates="selectedDates"
					:selection-mode="selectionMode"
					:variant="calendarVariant"
					:min-date="minDate"
					:max-date="maxDate"
					:disabled-dates="disabledDates"
					:disabled-weekdays="disabledWeekdays"
					:disable-from="disableFrom"
					:disable-to="disableTo"
					:highlights="highlights"
					:weekends="weekends"
					:first-day-of-week="firstDayOfWeek"
					:show-time="showTime"
					:show-seconds="showSeconds"
					:is24-hour="is24Hour"
					:show-week-number="showWeekNumber"
					:locale="locale"
					:size-scale="sizeScale"
					:initial-month="item.month"
					:initial-year="item.year"
					@update:model-value="handleModelUpdate"
					@update:model-value-end="handleModelEndUpdate"
					@update:selected-dates="handleSelectedUpdate"
					@range-select="handleRangeSelect"
					@month-change="m => handleMonthChange(m, monthItems.indexOf(item))"
					@year-change="y => handleYearChange(y, monthItems.indexOf(item))" />
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import './DatePickerPanel.style.scss'
import type { DatePickerPanelEmits, DatePickerPanelProps } from './DatePickerPanel.types'

import { BaseButton } from '@components/BaseButton'
import { BaseCalendar } from '@components/BaseCalendar'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useCustomClass } from '@composables/useCustomClass'
import { computed, ref, watch } from 'vue'

const props = withDefaults(defineProps<DatePickerPanelProps>(), {
	isOpen: false,
	selectionMode: 'single',
	calendarVariant: 'default',
	firstDayOfWeek: 1,
	locale: 'ru-RU',
	sizeScale: 100,
	showTime: false,
	showSeconds: false,
	is24Hour: true,
	showWeekNumber: false,
	selectedDates: () => [],
	minDate: null,
	maxDate: null,
	disabledDates: () => [],
	disabledWeekdays: () => [],
	disableFrom: null,
	disableTo: null,
	highlights: () => [],
	weekends: null,
	monthsCount: 1,
})

const emit = defineEmits<DatePickerPanelEmits>()

const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: [
		'root',
		'header',
		'navGroupPrev',
		'navGroupNext',
		'navBtn',
		'navBtnDouble',
		'navIcon',
		'yearTitle',
		'yearText',
		'calendar',
	],
})

/** Ref на элемент панели (для useClickOutside из родителя) */
const panelRef = ref<HTMLElement | null>(null)

/** Нормализованное количество месяцев */
const safeMonthsCount = computed((): number => {
	const count = typeof props.monthsCount === 'number' ? props.monthsCount : 1
	if (!Number.isFinite(count)) return 1
	if (count < 1) return 1
	return Math.floor(count)
})

/** Текст заголовка с годом */
const displayYear = computed(() => {
	const startYear = currentBaseDate.value.getFullYear()
	const lastMonthDate = new Date(startYear, currentBaseDate.value.getMonth() + safeMonthsCount.value - 1, 1)
	const endYear = lastMonthDate.getFullYear()
	return startYear === endYear ? `${startYear}` : `${startYear} - ${endYear}`
})

/** Дата, определяющая первый отображаемый месяц */
const currentBaseDate = ref<Date>(new Date())

/** Инициализация базовой даты при открытии или изменении значения */
watch(
	() => props.isOpen,
	isOpen => {
		if (isOpen) {
			const date =
				props.modelValue ||
				props.modelValueEnd ||
				(props.selectedDates.length > 0 ? props.selectedDates[0] : new Date())
			currentBaseDate.value = new Date(date.getFullYear(), date.getMonth(), 1)
		}
	},
	{ immediate: true },
)

/** Последовательность месяцев без дублирования порядка */
const monthItems = computed((): Array<{ key: string; month: number; year: number }> => {
	const result: Array<{ key: string; month: number; year: number }> = []

	for (let index = 0; index < safeMonthsCount.value; index++) {
		const monthDate = new Date(currentBaseDate.value.getFullYear(), currentBaseDate.value.getMonth() + index, 1)
		result.push({
			key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
			month: monthDate.getMonth(),
			year: monthDate.getFullYear(),
		})
	}

	return result
})

/** Обработка смены месяца в любом из календарей */
function handleMonthChange(month: number, itemIndex: number): void {
	const newBaseDate = new Date(
		currentBaseDate.value.getFullYear(),
		currentBaseDate.value.getMonth() + (month - (currentBaseDate.value.getMonth() + itemIndex)),
		1,
	)
	currentBaseDate.value = newBaseDate
}

/** Обработка смены года в любом из календарей */
function handleYearChange(year: number, itemIndex: number): void {
	const targetDate = new Date(currentBaseDate.value.getFullYear(), currentBaseDate.value.getMonth() + itemIndex, 1)
	const yearDiff = year - targetDate.getFullYear()

	currentBaseDate.value = new Date(currentBaseDate.value.getFullYear() + yearDiff, currentBaseDate.value.getMonth(), 1)
}

/** Проксирование modelValue */
function handleModelUpdate(value: Date | null): void {
	emit('model-update', value)
}

/** Проксирование modelValueEnd */
function handleModelEndUpdate(value: Date | null): void {
	emit('model-end-update', value)
}

/** Проксирование selectedDates */
function handleSelectedUpdate(value: Date[]): void {
	emit('selected-update', value)
}

/** Проксирование range-select */
function handleRangeSelect(start: Date, end: Date): void {
	emit('range-select', start, end)
}

/** Переход на предыдущий диапазон месяцев */
function handlePrevRange(): void {
	currentBaseDate.value = new Date(
		currentBaseDate.value.getFullYear(),
		currentBaseDate.value.getMonth() - safeMonthsCount.value,
		1,
	)
}

/** Переход на следующий диапазон месяцев */
function handleNextRange(): void {
	currentBaseDate.value = new Date(
		currentBaseDate.value.getFullYear(),
		currentBaseDate.value.getMonth() + safeMonthsCount.value,
		1,
	)
}

/** Переход на предыдущий год */
function handlePrevYear(): void {
	currentBaseDate.value = new Date(currentBaseDate.value.getFullYear() - 1, currentBaseDate.value.getMonth(), 1)
}

/** Переход на следующий год */
function handleNextYear(): void {
	currentBaseDate.value = new Date(currentBaseDate.value.getFullYear() + 1, currentBaseDate.value.getMonth(), 1)
}

/** Открыть panelRef для родителя */
defineExpose({ panelRef })
</script>
