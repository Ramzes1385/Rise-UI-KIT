import type { Ref } from 'vue'
import { useUi } from '@composables/base/useUi'
import { computed, ref, toRef, useId } from 'vue'
import { isImeKeydown } from '@utils/dom/keyboardUtils'
import { useFormField } from '@composables/form/useFormField'
import { useFieldControl } from '@composables/form/useFormContext'
import { useMaskedInputHandlers } from '@composables/form/useInputMask'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { usePasswordVisibility } from '@composables/form/usePasswordVisibility'
import type { BaseInputEmits, InputProps, PasswordRuleResult } from '../types/BaseInput.types'

const INPUT_ELEMENTS = [
	'root',
	'label',
	'required',
	'wrapper',
	'icon',
	'prefix',
	'field',
	'passwordToggle',
	'clear',
	'passwordIcon',
	'postfix',
	'passwordRules',
	'passwordRule',
	'passwordRuleIcon',
	'errorText',
]

function toText(value: InputProps['modelValue']): string {
	return value == null ? '' : String(value)
}

function useInputControl(props: InputProps) {
	const errorId = `${useId()}-error`
	const formField = useFormField({ value: () => props.modelValue, error: () => props.error, isRequired: () => props.isRequired })
	const control = useFieldControl({
		id: () => props.inputAttrs?.id as string | undefined,
		describedBy: () =>
			[formField.error ? errorId : undefined, props.inputAttrs?.['aria-describedby']].filter(Boolean).join(' ') || undefined,
		hasError: () => Boolean(formField.error),
		isRequired: () => props.isRequired,
	})

	return {
		errorId,
		formField,
		control,
		inputId: control.id,
		nativeAttrs: computed(() => ({
			...props.inputAttrs,
			...(props.type === 'search' ? { enterkeyhint: 'search' as const } : {}),
			...(props.ariaLabel ? { 'aria-label': props.ariaLabel } : {}),
			...Object.fromEntries(Object.entries(control.aria.value).filter(([, value]) => value !== undefined)),
		})),
	}
}

function useMaskedValue(props: InputProps, emit: BaseInputEmits, inputRef: Ref<HTMLInputElement | null>) {
	const masked = useMaskedInputHandlers({
		getMask: () => props.mask,
		getAllowedChars: () => props.allowedChars,
		getValue: () => props.modelValue,
		isPassword: () => props.type === 'password',
		isReadonly: () => props.isReadonly || props.isDisabled,
		emit: (event, value) => emit(event, value),
		onKeydown: e => emit('keydown', e),
		inputRef,
	})

	return {
		masked,
		displayValue: computed(() => {
			const value = toText(props.modelValue)
			if (props.type === 'password' || !props.mask) return value
			return masked.applyMask(value, props.mask)
		}),
	}
}

export function useBaseInput(props: InputProps, emit: BaseInputEmits) {
	const standard = useStandardBaseComponent('base-input', props, INPUT_ELEMENTS)
	const inputRef = ref<HTMLInputElement | null>(null)
	const field = useInputControl(props)
	const maskedValue = useMaskedValue(props, emit, inputRef)
	const isClearVisible = computed(
		() => props.type === 'search' && !props.isDisabled && !props.isReadonly && toText(props.modelValue) !== '',
	)

	return {
		...standard,
		inputRef,
		...field,
		ui: useUi(props, 'base-input'),
		...maskedValue,
		...usePasswordVisibility({ type: toRef(props, 'type') }),
		isClearVisible,
		handleKeydown(event: KeyboardEvent): void {
			maskedValue.masked.handleKeydown(event)
			if (event.key !== 'Escape' || event.defaultPrevented || isImeKeydown(event) || !isClearVisible.value) return
			event.preventDefault()
			emit('update:modelValue', '')
		},
		clearSearch(): void {
			emit('update:modelValue', '')
			inputRef.value?.focus()
		},
		iconName: computed(() => props.icon ?? (props.type === 'search' ? 'search' : '')),
		passwordRuleResults: computed<PasswordRuleResult[]>(() => {
			if (!props.passwordRules) return []
			const value = toText(props.modelValue)
			return props.passwordRules.map(rule => ({ key: rule.key, label: rule.label, isValid: rule.validate(value) }))
		}),
		handleBlur(e: FocusEvent): void {
			field.formField.onBlur()
			emit('blur', e)
		},
		handleFocus(e: FocusEvent): void {
			emit('focus', e)
		},
		exposed: {
			rootRef: inputRef,
			inputRef,
			focus: () => inputRef.value?.focus(),
			blur: () => inputRef.value?.blur(),
			validate: field.formField.validate,
			reset: field.formField.reset,
		},
	}
}
