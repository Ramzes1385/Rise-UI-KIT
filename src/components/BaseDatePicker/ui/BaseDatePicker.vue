<template>
	<div ref="wrapperRef" :class="[ui('root'), classes.root]" :style="[sizeScaleStyle, customColorStyle]">
		<DatePickerField
			:display-value="displayValue"
			:placeholder="resolvedProps.placeholder"
			:label="resolvedProps.label"
			:error="formField.error"
			:is-disabled="resolvedProps.isDisabled"
			:is-readonly="resolvedProps.isReadonly"
			:is-required="resolvedProps.isRequired"
			:is-open="isOpen"
			:is-clearable="resolvedProps.isClearable"
			:has-value="hasValue"
			:input-variant="resolvedProps.inputVariant"
			:color="color"
			:size-scale="resolvedProps.sizeScale"
			:custom-class="classes.field"
			:class="ui('field')"
			:part-class="ui"
			@field-click="handleFieldClick"
			@keyboard-open="handleKeyboardOpen"
			@clear-click="handleClear"
			@icon-click="handleFieldClick">
			<template #icon>
				<slot name="icon" />
			</template>
		</DatePickerField>

		<DatePickerPanel
			ref="panelRef"
			:is-open="isOpen"
			:model-value="activeValue"
			:model-value-end="activeValueEnd"
			:selected-dates="activeDates"
			:selection-mode="resolvedProps.selectionMode"
			:calendar-variant="resolvedProps.calendarVariant"
			:calendar-config="calendarConfig"
			:size-scale="resolvedProps.sizeScale"
			:months-count="computedMonthsCount"
			:panel-style="panelStyle"
			:theme="currentTheme"
			:rise-theme="currentRiseTheme"
			:motion-preset="currentMotion"
			:custom-class="classes.panel"
			:part-class="ui"
			@model-update="handleModelUpdate"
			@model-end-update="handleModelEndUpdate"
			@selected-update="handleSelectedDatesUpdate"
			@range-select="handleRangeSelect" />
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseDatePicker.style.scss'
import { useBaseDatePicker } from '../model/useBaseDatePicker'
import DatePickerField from './DatePickerField/DatePickerField.vue'
import DatePickerPanel from './DatePickerPanel/DatePickerPanel.vue'
import type { BaseDatePickerEmits, BaseDatePickerProps, BaseDatePickerSlots } from '../types/BaseDatePicker.types'

const props = defineProps<BaseDatePickerProps>()

const emit = defineEmits<BaseDatePickerEmits>()
defineSlots<BaseDatePickerSlots>()

const {
	ui,
	resolvedProps,
	formField,
	sizeScaleStyle,
	customColorStyle,
	classes,
	calendarConfig,
	isOpen,
	currentTheme,
	currentRiseTheme,
	currentMotion,
	wrapperRef,
	panelRef,
	computedMonthsCount,
	panelStyle,
	activeValue,
	activeValueEnd,
	activeDates,
	hasValue,
	displayValue,
	handleFieldClick,
	handleKeyboardOpen,
	handleClear,
	handleModelUpdate,
	handleModelEndUpdate,
	handleSelectedDatesUpdate,
	handleRangeSelect,
	exposed,
} = useBaseDatePicker(props, emit)

defineExpose(exposed)
</script>
