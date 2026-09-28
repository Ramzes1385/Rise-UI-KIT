/** Composable: логика BaseDatePicker — значения по умолчанию, поле с датой и панель календаря */
import { computed } from 'vue'
import { UI_TEXT } from '@/locales/messages'
import { useFormField } from '@composables/useFormField'
import { useSizeScale } from '@composables/useSizeScale'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useDatePickerState } from '@composables/useDatePickerState'
import { useExplicitPropDetection } from '@composables/useExplicitPropDetection'
import { resolveDatePickerCalendarConfig } from './datePickerCalendarConfig'
import type { BaseDatePickerEmits, DatePickerProps } from '../types/BaseDatePicker.types'

function resolveDisplayProps(props: DatePickerProps) {
	return {
		selectionMode: props.selectionMode ?? 'single',
		placeholder: props.placeholder ?? UI_TEXT.SELECT_DATE,
		dateFormat: props.dateFormat ?? 'dd.MM.yyyy',
		inputVariant: props.inputVariant ?? 'default',
		calendarVariant: props.calendarVariant ?? 'ghost',
		sizeScale: props.sizeScale ?? 100,
		gap: props.gap ?? 4,
		label: props.label ?? '',
		error: props.error ?? '',
	}
}

/** isReadonly, closeOnClickOutside и closeOnEscape по умолчанию true: значение пропа учитывается, только если его передали */
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
		isMultiMonth: props.isMultiMonth ?? false,
	}
}

export function useBaseDatePicker(props: DatePickerProps, emit: BaseDatePickerEmits) {
	const { wasPropPassed, resolveBooleanPropDefault } = useExplicitPropDetection()
	const resolvedProps = computed(() => ({ ...resolveDisplayProps(props), ...resolveFlagProps(props, resolveBooleanPropDefault) }))
	const formField = useFormField({ value: () => props.modelValue ?? null, error: () => props.error, isRequired: () => props.isRequired })
	const { sizeScaleStyle } = useSizeScale({ getScale: () => resolvedProps.value.sizeScale })
	const { customColorStyle } = useCustomColor({ getColor: () => props.color })
	const { classes } = useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'field', 'panel'] })
	// Календарные под-пропы (locale, firstDayOfWeek и др.) попадают в calendarConfig, только если их передали явно
	const calendarConfig = computed(() => resolveDatePickerCalendarConfig(props, wasPropPassed, props.calendarConfig))
	const state = useDatePickerState({ props, resolvedProps, emit, calendarConfig })

	return {
		resolvedProps,
		formField,
		sizeScaleStyle,
		customColorStyle,
		classes,
		calendarConfig,
		...state,
		exposed: { rootRef: state.wrapperRef, validate: formField.validate, reset: formField.reset },
	}
}
