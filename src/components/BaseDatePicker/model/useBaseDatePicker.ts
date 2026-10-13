import { computed } from 'vue'
import { UI_TEXT } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { useSizeScale } from '@composables/base/useSizeScale'
import { useFormField } from '@composables/form/useFormField'
import { useDatePickerRange } from './range/useDatePickerRange'
import { useCustomClass } from '@composables/base/useCustomClass'
import { useCustomColor } from '@composables/base/useCustomColor'
import { resolveDatePickerCalendarConfig } from './datePickerCalendarConfig'
import { useDatePickerState } from '@composables/calendar/useDatePickerState'
import { normalizeDayLimit, resolveRangeLimits } from './range/dateRangeLimits'
import { useExplicitPropDetection } from '@composables/base/useExplicitPropDetection'
import type { BaseDatePickerEmits, DatePickerProps } from '../types/BaseDatePicker.types'

function resolveDisplayProps(props: DatePickerProps) {
	return {
		selectionMode: props.selectionMode ?? 'single',
		placeholder: props.placeholder ?? UI_TEXT.SELECT_DATE,
		dateFormat: props.dateFormat ?? 'dd.MM.yyyy',
		inputVariant: props.inputVariant ?? 'default',
		calendarVariant: props.calendarVariant ?? 'ghost',
		sizeScale: props.sizeScale ?? 100,
		label: props.label ?? '',
		error: props.error ?? '',
	}
}

function resolveLayoutProps(props: DatePickerProps) {
	return {
		gap: props.gap ?? 4,
		maxMonths: props.maxMonths ?? Number.POSITIVE_INFINITY,
		monthsShown: normalizeDayLimit(props.monthsShown),
	}
}

function hasPresetsColumn(props: DatePickerProps): boolean {
	const { presets, selectionMode } = props
	return selectionMode === 'range' && (presets === true || (Array.isArray(presets) && presets.length > 0))
}

function resolveRangeProps(props: DatePickerProps) {
	return { presets: props.presets ?? false, hasPresets: hasPresetsColumn(props), ...resolveRangeLimits(props.minDays, props.maxDays) }
}

function resolveFlagProps(
	props: DatePickerProps,
	resolveBoolean: ReturnType<typeof useExplicitPropDetection>['resolveBooleanPropDefault'],
) {
	return {
		isDisabled: props.isDisabled ?? false,
		isReadonly: resolveBoolean('isReadonly', props.isReadonly, true),
		isRequired: props.isRequired ?? false,
		isClearable: props.isClearable ?? false,
		closeOnClickOutside: resolveBoolean('closeOnClickOutside', props.closeOnClickOutside, true),
		closeOnEscape: resolveBoolean('closeOnEscape', props.closeOnEscape, true),
		isMultiMonth: resolveBoolean('isMultiMonth', props.isMultiMonth, true),
	}
}

function withTextReset<Args extends unknown[]>(handler: (...args: Args) => void, reset: () => void): (...args: Args) => void {
	return (...args) => {
		reset()
		handler(...args)
	}
}

export function useBaseDatePicker(props: DatePickerProps, emit: BaseDatePickerEmits) {
	const { wasPropPassed, resolveBooleanPropDefault } = useExplicitPropDetection()
	const resolvedProps = computed(() => ({
		...resolveDisplayProps(props),
		...resolveLayoutProps(props),
		...resolveRangeProps(props),
		...resolveFlagProps(props, resolveBooleanPropDefault),
	}))
	const formField = useFormField({ value: () => props.modelValue ?? null, error: () => props.error, isRequired: () => props.isRequired })
	const { sizeScaleStyle } = useSizeScale({ getScale: () => resolvedProps.value.sizeScale })
	const { customColorStyle } = useCustomColor({ getColor: () => props.color })
	const { classes } = useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'field', 'panel'] })
	const calendarConfig = computed(() => resolveDatePickerCalendarConfig(props, wasPropPassed, props.calendarConfig))
	const state = useDatePickerState({ props, resolvedProps, emit, calendarConfig })
	const range = useDatePickerRange({ resolvedProps, calendarConfig, emit, ...state, actions: state })

	return {
		ui: useUi(props, 'base-date-picker'),
		resolvedProps,
		formField,
		sizeScaleStyle,
		customColorStyle,
		classes,
		calendarConfig,
		...state,
		...range,
		handleClear: withTextReset(state.handleClear, range.handleTextCancel),
		handleModelUpdate: withTextReset(state.handleModelUpdate, range.handleTextCancel),
		handleModelEndUpdate: withTextReset(state.handleModelEndUpdate, range.handleTextCancel),
		handleRangeSelect: withTextReset(state.handleRangeSelect, range.handleTextCancel),
		fieldError: computed(() => formField.error || range.inputError.value),
		exposed: { rootRef: state.wrapperRef, validate: formField.validate, reset: formField.reset },
	}
}
