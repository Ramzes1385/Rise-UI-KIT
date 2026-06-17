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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useClickOutside } from '@composables/useClickOutside'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useDropdownPosition } from '@composables/useDropdownPosition'
import { useEscapeKey } from '@composables/useEscapeKey'
import { useExplicitPropDetection } from '@composables/useExplicitPropDetection'
import { useFormField } from '@composables/useFormField'
import { useSizeScale } from '@composables/useSizeScale'
import { UI_CHAT_DEFAULT_HEIGHT, UI_SELECT_DATE_TEXT } from '@constants'
import '../styles/BaseDatePicker.style.scss'
import { formatDatePickerValue } from '@utils/dateUtils'
import { resolveDatePickerCalendarConfig } from '../model/BaseDatePickerCalendar.types'
import DatePickerField from './DatePickerField/DatePickerField.vue'
import DatePickerPanel from './DatePickerPanel/DatePickerPanel.vue'
import type { BaseDatePickerEmits, BaseDatePickerProps } from '../model/BaseDatePicker.types'

const props = defineProps<BaseDatePickerProps>()
const { wasPropPassed, resolveBooleanPropDefault } = useExplicitPropDetection()

const resolvedProps = computed(() => ({
	selectionMode: props.selectionMode ?? 'single',
	placeholder: props.placeholder ?? UI_SELECT_DATE_TEXT,
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
	gap: props.gap ?? 4,
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

const isOpen = ref(false)
const currentTheme = ref<string | null>(null)
const wrapperRef = ref<HTMLElement | null>(null)
const panelRef = ref<InstanceType<typeof DatePickerPanel> | null>(null)

const innerValue = ref<Date | null>(props.modelValue ?? null)
const innerValueEnd = ref<Date | null>(props.modelValueEnd ?? null)
const innerDates = ref<Date[]>(props.selectedDates ? [...props.selectedDates] : [])

const wrapperWidth = ref(0)
let resizeObserver: ResizeObserver | null = null

/** Расчет количества месяцев, если включен isMultiMonth */
const computedMonthsCount = computed((): number => {
	if (!resolvedProps.value.isMultiMonth) return 1

	const scale = resolvedProps.value.sizeScale / 100
	// Минимальная ширина календаря для расчета
	const minCalendarWidth = 260 * scale
	const gap = 8 * scale
	const padding = 16 * scale

	const currentWidth = wrapperWidth.value || (wrapperRef.value?.clientWidth ?? 0)
	const availableWidth = currentWidth - padding + gap
	const stepWidth = minCalendarWidth + gap

	const count = Math.floor(availableWidth / stepWidth)

	return Math.max(1, count)
})

/** DOM-элемент панели (из expose дочернего компонента) */
const panelEl = computed(() => panelRef.value?.panelRef ?? null)

/** Позиционирование панели — всегда bottom-start */
const { panelStyle } = useDropdownPosition({
	wrapperRef,
	dropdownRef: panelEl,
	position: () => 'bottom-start',
	gap: () => resolvedProps.value.gap,
	matchWidth: () => resolvedProps.value.isMultiMonth,
	maxHeight: () => UI_CHAT_DEFAULT_HEIGHT,
	isOpen: () => isOpen.value,
})

watch(
	() => props.modelValue,
	value => {
		if (value === undefined) return
		innerValue.value = value
	},
)

watch(
	() => props.modelValueEnd,
	value => {
		if (value === undefined) return
		innerValueEnd.value = value
	},
)

watch(
	() => props.selectedDates,
	value => {
		if (!value) return
		innerDates.value = [...value]
	},
)

const activeValue = computed((): Date | null => {
	if (props.modelValue === undefined) return innerValue.value
	return props.modelValue
})

const activeValueEnd = computed((): Date | null => {
	if (props.modelValueEnd === undefined) return innerValueEnd.value
	return props.modelValueEnd
})

const activeDates = computed((): Date[] => {
	if (props.selectedDates === undefined) return innerDates.value
	return props.selectedDates
})

const calendarConfig = computed(() =>
	resolveDatePickerCalendarConfig(props, wasPropPassed, props.calendarConfig),
)

/** Есть ли выбранное значение */
const hasValue = computed((): boolean => {
	if (resolvedProps.value.selectionMode === 'range') {
		return !!(activeValue.value || activeValueEnd.value)
	}
	if (resolvedProps.value.selectionMode === 'multiple') {
		return activeDates.value.length > 0
	}
	return !!activeValue.value
})

/** Отформатированное значение для инпута */
const displayValue = computed((): string =>
	formatDatePickerValue({
		selectionMode: resolvedProps.value.selectionMode,
		date: activeValue.value,
		endDate: activeValueEnd.value,
		dates: activeDates.value,
		dateFormat: resolvedProps.value.dateFormat,
		showTime: calendarConfig.value.showTime,
		showSeconds: calendarConfig.value.showSeconds,
		is24Hour: calendarConfig.value.is24Hour,
		locale: calendarConfig.value.locale,
	}),
)

/** Открыть дропдаун */
function open(): void {
	if (resolvedProps.value.isDisabled) return
	if (isOpen.value) return

	/* istanbul ignore else -- defensive: wrapperRef всегда привязан после mount */
	if (wrapperRef.value) {
		// Обновляем ширину перед открытием для точного расчета месяцев
		if (resolvedProps.value.isMultiMonth) {
			wrapperWidth.value = wrapperRef.value.clientWidth
		}
		// Определяем текущую тему
		const themeEl = wrapperRef.value.closest('[data-theme]')
		currentTheme.value = themeEl?.getAttribute('data-theme') ?? null
	}

	isOpen.value = true
	emit('open')
}

/** Закрыть дропдаун */
function close(): void {
	if (!isOpen.value) return
	isOpen.value = false
	emit('close')
}

/** Клик по полю — всегда открывает */
function handleFieldClick(): void {
	open()
}

/** Очистить значение */
function handleClear(): void {
	innerValue.value = null
	innerValueEnd.value = null
	innerDates.value = []
	emit('update:modelValue', null)
	emit('update:modelValueEnd', null)
	emit('update:selectedDates', [])
	emit('clear')
}

/** Обновление modelValue */
function handleModelUpdate(value: Date | null): void {
	innerValue.value = value
	emit('update:modelValue', value)
	if (resolvedProps.value.selectionMode === 'single' && value && !calendarConfig.value.showTime) {
		close()
	}
}

/** Обновление modelValueEnd */
function handleModelEndUpdate(value: Date | null): void {
	innerValueEnd.value = value
	emit('update:modelValueEnd', value)
}

/** Обновление selectedDates */
function handleSelectedDatesUpdate(value: Date[]): void {
	innerDates.value = [...value]
	emit('update:selectedDates', value)
}

/** Выбор диапазона */
function handleRangeSelect(start: Date, end: Date): void {
	innerValue.value = start
	innerValueEnd.value = end
	emit('update:modelValue', start)
	emit('update:modelValueEnd', end)
	emit('range-select', start, end)

	if (!calendarConfig.value.showTime) {
		close()
	}
}

onMounted(() => {
	if (resolvedProps.value.isMultiMonth && wrapperRef.value) {
		wrapperWidth.value = wrapperRef.value.clientWidth
		resizeObserver = new ResizeObserver(entries => {
			for (const entry of entries) {
				if (entry.contentBoxSize && entry.contentBoxSize[0]) {
					wrapperWidth.value = entry.target.clientWidth
				} else {
					wrapperWidth.value = entry.contentRect.width
				}
			}
		})
		resizeObserver.observe(wrapperRef.value)
	}
})

onUnmounted(() => {
	resizeObserver?.disconnect()
})

/** Закрытие по клику снаружи */
useClickOutside({
	targets: [wrapperRef, panelEl],
	callback: close,
	isActive: () => isOpen.value && resolvedProps.value.closeOnClickOutside,
})

/** Закрытие по Escape */
useEscapeKey({
	isActive: () => isOpen.value && resolvedProps.value.closeOnEscape,
	callback: close,
})

defineExpose({
	validate: formField.validate,
	reset: formField.reset,
})
</script>
