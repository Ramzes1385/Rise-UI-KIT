import type { Ref } from 'vue'
/** Composable: логика BaseInput — связь с BaseFormField, маска, видимость пароля и его правила */
import { computed, ref, toRef, useId } from 'vue'
import { useFormField } from '@composables/useFormField'
import { useFieldControl } from '@composables/useFormContext'
import { useMaskedInputHandlers } from '@composables/useInputMask'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { usePasswordVisibility } from '@composables/usePasswordVisibility'
import type { BaseInputEmits, InputProps, PasswordRuleResult } from '../types/BaseInput.types'

const INPUT_ELEMENTS = [
	'root',
	'label',
	'required',
	'wrapper',
	'prefix',
	'field',
	'passwordToggle',
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

/** Поле и BaseFormField вокруг: id (подпись связана через for), описания, aria-invalid и aria-required */
function useInputControl(props: InputProps) {
	// id текста ошибки: поле описано ею через aria-describedby
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
		// Атрибуты нативного поля: inputAttrs, имя без подписи (ariaLabel) и aria-состояния поля и обёртки
		nativeAttrs: computed(() => ({
			...props.inputAttrs,
			...(props.ariaLabel ? { 'aria-label': props.ariaLabel } : {}),
			...control.aria.value,
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

	return {
		...standard,
		inputRef,
		...field,
		...useMaskedValue(props, emit, inputRef),
		...usePasswordVisibility({ type: toRef(props, 'type') }),
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
			/* istanbul ignore next — defensive: optional chaining для public API на unmount */
			focus: () => inputRef.value?.focus(),
			/* istanbul ignore next — defensive: optional chaining для public API на unmount */
			blur: () => inputRef.value?.blur(),
			validate: field.formField.validate,
			reset: field.formField.reset,
		},
	}
}
