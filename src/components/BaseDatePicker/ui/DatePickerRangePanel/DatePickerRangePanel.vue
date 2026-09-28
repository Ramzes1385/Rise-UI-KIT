<template>
	<BaseCalendar
		v-for="(item, index) in monthItems"
		:key="item.key"
		class="date-picker-panel__calendar"
		v-bind="index === 0 ? calendarBindings : secondaryCalendarBindings"
		:model-value="modelValue"
		:model-value-end="modelValueEnd"
		:selected-dates="selectedDates"
		selection-mode="range"
		:variant="calendarVariant"
		:size-scale="sizeScale"
		:initial-month="item.month"
		:initial-year="item.year"
		@update:model-value="handleModelUpdate"
		@update:model-value-end="handleModelEndUpdate"
		@update:selected-dates="handleSelectedUpdate"
		@range-select="handleRangeSelect"
		@month-change="month => emit('month-change', month, index)"
		@year-change="year => emit('year-change', year, index)" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseCalendar } from '@components/BaseCalendar'
import { toBaseCalendarProps, withoutTimeBlock } from '../../model/datePickerCalendarConfig'
import type { DatePickerRangePanelEmits, DatePickerRangePanelProps } from '../../types/DatePickerRangePanel.types'

const props = defineProps<DatePickerRangePanelProps>()

const emit = defineEmits<DatePickerRangePanelEmits>()

/** Props BaseCalendar: год и «Сегодня» — только в одиночном месяце */
const calendarBindings = computed(() =>
	toBaseCalendarProps(props.calendarConfig, {
		showYear: props.monthItems.length === 1,
		showTodayButton: props.monthItems.length === 1,
	}),
)

/** Календари после первого — без блока времени: он один на всё значение */
const secondaryCalendarBindings = computed(() => withoutTimeBlock(calendarBindings.value))

function handleModelUpdate(value: Date | null): void {
	emit('model-update', value)
}

function handleModelEndUpdate(value: Date | null): void {
	emit('model-end-update', value)
}

function handleSelectedUpdate(value: Date[]): void {
	emit('selected-update', value)
}

function handleRangeSelect(start: Date, end: Date): void {
	emit('range-select', start, end)
}
</script>
