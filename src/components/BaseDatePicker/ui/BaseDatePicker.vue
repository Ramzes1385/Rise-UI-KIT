<template>
	<div ref="wrapperRef" class="base-date-picker" :class="classes.root" :style="[sizeScaleStyle, customColorStyle]">
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
			:custom-class="classes.panel"
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

// Дефолты резолвятся через useExplicitPropDetection, а не withDefaults:
// 1) boolean-пропы с дефолтом true (isReadonly, closeOnClickOutside, closeOnEscape) требуют wasPropPassed
// 2) календарные под-пропы (locale, firstDayOfWeek и др.) явно пробрасываются в calendarConfig
//    только если родитель их передал — иначе дефолты конфига не перезаписываются.
const props = defineProps<BaseDatePickerProps>()

const emit = defineEmits<BaseDatePickerEmits>()
defineSlots<BaseDatePickerSlots>()

const {
	resolvedProps,
	formField,
	sizeScaleStyle,
	customColorStyle,
	classes,
	calendarConfig,
	isOpen,
	currentTheme,
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
