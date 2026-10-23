/** Composable: управление полем формы (touched/dirty, валидация, reset) */
import { computed, ref, watch } from 'vue'
import { UI_TEXT } from '@/locales/messages'
import type { UseFormFieldOptions, UseFormFieldReturn } from './types/useFormField.types'

function isEmptyValue(value: unknown): boolean {
	return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)
}

/** Первая ошибка проверки значения (обязательность, затем правила по порядку); null — значение верно */
function findValidationError(options: UseFormFieldOptions): string | null {
	const val = options.value()
	if (options.isRequired?.() && isEmptyValue(val)) return UI_TEXT.REQUIRED_FIELD
	const failedRule = options.rules?.find(rule => !rule.validate(val))
	return failedRule ? failedRule.message : null
}

/** Composable для управления полем формы — touched/dirty, валидация, обработчики blur/change, reset. */
function useFormField(options: UseFormFieldOptions): UseFormFieldReturn {
	const isTouched = ref(false)
	const isDirty = ref(false)
	const initialValue = options.value()

	watch(
		() => options.value(),
		val => {
			if (val !== initialValue) {
				isDirty.value = true
			}
		},
	)

	const touchedError = computed<string>(() => (isTouched.value ? (findValidationError(options) ?? '') : ''))

	const error = computed<string>(() => options.error?.() || touchedError.value)

	const isValid = computed<boolean>(() => {
		if (options.error?.()) return false
		return !isTouched.value || findValidationError(options) === null
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
		get error() {
			return error.value
		},
		get isTouched() {
			return isTouched.value
		},
		get isDirty() {
			return isDirty.value
		},
		get isValid() {
			return isValid.value
		},
		validate,
		reset,
		onBlur,
	}
}

export { useFormField }
