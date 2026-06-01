<template>
	<div ref="wrapperRef" class="base-date-picker" :class="classes.root" :style="[sizeScaleStyle, customColorStyle]">
		<DatePickerField
			:display-value="displayValue"
			:placeholder="placeholder"
			:label="label"
			:error="error"
			:is-disabled="isDisabled"
			:is-readonly="isReadonly"
			:is-required="isRequired"
			:is-open="isOpen"
			:is-clearable="isClearable"
			:has-value="hasValue"
			:input-variant="inputVariant"
			:color="color"
			:size-scale="sizeScale"
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
			:selection-mode="selectionMode"
			:calendar-variant="calendarVariant"
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
import { useClickOutside } from '@composables/useClickOutside'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useDropdownPosition } from '@composables/useDropdownPosition'
import { useEscapeKey } from '@composables/useEscapeKey'
import { useSizeScale } from '@composables/useSizeScale'
import { formatDate, formatMultiple, formatRange } from '@utils/dateUtils'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import './BaseDatePicker.style.scss'
import type { BaseDatePickerEmits, BaseDatePickerProps } from './BaseDatePicker.types'
import DatePickerField from './ui/DatePickerField/DatePickerField.vue'
import DatePickerPanel from './ui/DatePickerPanel/DatePickerPanel.vue'

const props = withDefaults(defineProps<BaseDatePickerProps>(), {
	selectionMode: 'single',
	placeholder: 'Выберите дату',
	dateFormat: 'dd.MM.yyyy',
	inputVariant: 'outline',
	calendarVariant: 'default',
	sizeScale: 100,
	isDisabled: false,
	isReadonly: true,
	isRequired: false,
	isClearable: false,
	minDate: null,
	maxDate: null,
	disabledDates: () => [],
	disabledWeekdays: () => [],
	disableFrom: null,
	disableTo: null,
	highlights: () => [],
	weekends: null,
	firstDayOfWeek: 1,
	locale: 'ru-RU',
	showTime: false,
	showSeconds: false,
	is24Hour: true,
	showWeekNumber: false,
	closeOnClickOutside: true,
	closeOnEscape: true,
	gap: 4,
	label: '',
	error: '',
	isMultiMonth: false,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
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
	if (!props.isMultiMonth) return 1

	const scale = props.sizeScale / 100
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
	gap: () => props.gap,
	matchWidth: () => props.isMultiMonth,
	maxHeight: () => '500px',
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

/** Есть ли выбранное значение */
const hasValue = computed((): boolean => {
	if (props.selectionMode === 'range') {
		return !!(activeValue.value || activeValueEnd.value)
	}
	if (props.selectionMode === 'multiple') {
		return activeDates.value.length > 0
	}
	return !!activeValue.value
})

/** Базовые опции форматирования */
const formatBaseOpts = computed(() => ({
	dateFormat: props.dateFormat,
	showTime: props.showTime,
	showSeconds: props.showSeconds,
	is24Hour: props.is24Hour,
	locale: props.locale,
}))

/** Отформатированное значение для инпута */
const displayValue = computed((): string => {
	const opts = formatBaseOpts.value

	if (props.selectionMode === 'range') {
		return formatRange({
			...opts,
			start: activeValue.value,
			end: activeValueEnd.value,
		})
	}

	if (props.selectionMode === 'multiple') {
		return formatMultiple({ ...opts, dates: activeDates.value })
	}

	if (!activeValue.value) return ''
	return formatDate({ ...opts, date: activeValue.value })
})

/** Открыть дропдаун */
function open(): void {
	if (props.isDisabled) return
	if (isOpen.value) return

	/* istanbul ignore else -- defensive: wrapperRef всегда привязан после mount */
	if (wrapperRef.value) {
		// Обновляем ширину перед открытием для точного расчета месяцев
		if (props.isMultiMonth) {
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
	if (props.selectionMode === 'single' && value && !props.showTime) {
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

	if (!props.showTime) {
		close()
	}
}

onMounted(() => {
	if (props.isMultiMonth && wrapperRef.value) {
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
	isActive: () => isOpen.value && props.closeOnClickOutside,
})

/** Закрытие по Escape */
useEscapeKey({
	isActive: () => isOpen.value && props.closeOnEscape,
	callback: close,
})
</script>
