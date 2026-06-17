import { computed, ref, watch } from 'vue'
import type { UseFormFieldOptions, UseFormFieldReturn, ValidationRule } from './useFormField.types'

function useFormField(options: UseFormFieldOptions): UseFormFieldReturn {
	const isTouched = ref(false)
	const isDirty = ref(false)
	const initialValue = options.value()

	watch(() => options.value(), val => {
		if (val !== initialValue) {
			isDirty.value = true
		}
	})

	const touchedError = computed<string>(() => {
		const externalError = options.error?.()
		if (externalError) return externalError

		if (!isTouched.value) return ''

		const val = options.value()

		if (options.isRequired?.()) {
			if (val === null || val === undefined || val === '') {
				return 'Обязательное поле'
			}
		}

		if (options.rules) {
			for (const rule of options.rules) {
				if (!rule.validate(val)) return rule.message
			}
		}

		return ''
	})

	const error = computed<string>(() => {
		const externalError = options.error?.()
		if (externalError) return externalError
		return touchedError.value
	})

	const isValid = computed<boolean>(() => {
		if (options.error?.()) return false
		if (!isTouched.value) return true

		const val = options.value()
		if (options.isRequired?.()) {
			if (val === null || val === undefined || val === '') return false
		}
		if (options.rules) {
			return options.rules.every(rule => rule.validate(val))
		}
		return true
	})

	function validate(): boolean {
		isTouched.value = true
		return isValid.value
	}

	function reset(): void {
		isTouched.value = false
		isDirty.value = false
	}

	function onBlur(): void {
		isTouched.value = true
	}

	return {
		get error() { return error.value },
		get isTouched() { return isTouched.value },
		get isDirty() { return isDirty.value },
		get isValid() { return isValid.value },
		validate,
		reset,
		onBlur,
	}
}

export { useFormField }
export type { ValidationRule, UseFormFieldOptions, UseFormFieldReturn }
