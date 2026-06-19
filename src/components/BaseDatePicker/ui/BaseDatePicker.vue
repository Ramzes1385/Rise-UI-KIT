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
import { computed } from 'vue'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useDatePickerState } from '@composables/useDatePickerState'
import { useExplicitPropDetection } from '@composables/useExplicitPropDetection'
import { useFormField, type FormFieldValidateExpose } from '@composables/useFormField'
import { useSizeScale } from '@composables/useSizeScale'
import { UI_TEXT, UI_SIZE } from '@constants'
import '../styles/BaseDatePicker.style.scss'
import { resolveDatePickerCalendarConfig } from '../model/BaseDatePickerCalendar.types'
import DatePickerField from './DatePickerField/DatePickerField.vue'
import DatePickerPanel from './DatePickerPanel/DatePickerPanel.vue'
import type { BaseDatePickerEmits, BaseDatePickerProps, BaseDatePickerSlots } from '../model/BaseDatePicker.types'

// Дефолты резолвятся через useExplicitPropDetection, а не withDefaults:
// 1) boolean-пропы с дефолтом true (isReadonly, closeOnClickOutside, closeOnEscape) требуют wasPropPassed
// 2) календарные под-пропы (locale, firstDayOfWeek и др.) явно пробрасываются в calendarConfig
//    только если родитель их передал — иначе дефолты конфига не перезаписываются.
const props = defineProps<BaseDatePickerProps>()
const { wasPropPassed, resolveBooleanPropDefault } = useExplicitPropDetection()

const resolvedProps = computed(() => ({
	selectionMode: props.selectionMode ?? 'single',
	placeholder: props.placeholder ?? UI_TEXT.SELECT_DATE,
	dateFormat: props.dateFormat ?? 'dd.MM.yyyy',
	inputVariant: props.inputVariant ?? 'outline',
	calendarVariant: props.calendarVariant ?? 'default',
	sizeScale: props.sizeScale ?? 100,
	isDisabled: props.isDisabled ?? false,
	isReadonly: resolveBooleanPropDefault('isReadonly', props.isReadonly, true),
	isRequired: props.isRequired ?? false,
	isClearable: props.isClearable ?? false,
	closeOnClickOutside: resolveBooleanPropDefault('closeOnClickOutside', props.closeOnClickOutside, true),
	closeOnEscape: resolveBooleanPropDefault('closeOnEscape', props.closeOnEscape, true),
	gap: props.gap ?? UI_SIZE.DATEPICKER_GAP,
	label: props.label ?? '',
	error: props.error ?? '',
	isMultiMonth: props.isMultiMonth ?? false,
}))

const formField = useFormField({
	value: () => props.modelValue ?? null,
	error: () => props.error,
	isRequired: () => props.isRequired,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => resolvedProps.value.sizeScale })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'field', 'panel'],
})

const emit = defineEmits<BaseDatePickerEmits>()
defineSlots<BaseDatePickerSlots>()

const calendarConfig = computed(() =>
	resolveDatePickerCalendarConfig(props, wasPropPassed, props.calendarConfig),
)

const {
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
	handleClear,
	handleModelUpdate,
	handleModelEndUpdate,
	handleSelectedDatesUpdate,
	handleRangeSelect,
} = useDatePickerState({
	props,
	resolvedProps,
	emit,
	calendarConfig,
})

defineExpose<FormFieldValidateExpose>({
	rootRef: wrapperRef,
	validate: formField.validate,
	reset: formField.reset,
})
</script>
