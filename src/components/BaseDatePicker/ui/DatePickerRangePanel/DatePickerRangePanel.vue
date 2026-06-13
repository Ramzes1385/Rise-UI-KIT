<template>
	<BaseCalendar
		v-for="(item, index) in monthItems"
		:key="item.key"
		class="date-picker-panel__calendar"
		v-bind="calendarConfig"
		:show-navigation="false"
		:can-switch-view="false"
		:show-year="monthItems.length === 1"
		:show-today-button="monthItems.length === 1"
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
import { BaseCalendar } from '@components/BaseCalendar'
import type { DatePickerRangePanelEmits, DatePickerRangePanelProps } from './DatePickerRangePanel.types'

defineProps<DatePickerRangePanelProps>()

const emit = defineEmits<DatePickerRangePanelEmits>()

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
