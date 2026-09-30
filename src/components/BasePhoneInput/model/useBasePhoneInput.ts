import { computed, shallowRef, watch } from 'vue'
import { PHONE_COUNTRIES } from './phone/phoneCountries'
import { useCustomClass } from '@composables/base/useCustomClass'
import { useFormDisabled } from '@composables/form/useFormContext'
import { maskPlaceholder, maskSize, onlyDigits, parsePhone, pastedPhone } from './phone/phoneNumber'
import type { BasePhoneInputEmits, BasePhoneInputProps, PhoneCountry } from '../types/BasePhoneInput.types'

function usePhoneState(props: BasePhoneInputProps) {
	const countries = computed(() => props.countries ?? PHONE_COUNTRIES)
	const parsed = computed(() => parsePhone(props.modelValue ?? '', countries.value, props.country))
	const code = shallowRef(props.country ?? parsed.value.country?.code)
	const digits = shallowRef(parsed.value.digits)
	watch(parsed, value => {
		digits.value = value.digits
		if (value.country) code.value = value.country.code
	})
	watch(
		() => props.country,
		value => {
			if (value) code.value = value
		},
	)
	const country = computed(() => countries.value.find(item => item.code === code.value) ?? countries.value[0])
	return { countries, code, digits, country }
}

export function useBasePhoneInput(props: BasePhoneInputProps, emit: BasePhoneInputEmits) {
	const { countries, code, digits, country } = usePhoneState(props)
	const commit = (next: string): void => {
		digits.value = next
		emit('update:modelValue', next ? `+${country.value.dialCode}${next}` : '')
	}
	const selectCountry = (next: PhoneCountry): void => {
		code.value = next.code
		emit('update:country', next.code)
	}
	return {
		classes: useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'field', 'country'] }).classes,
		isControlDisabled: useFormDisabled(() => props.isDisabled),
		country,
		digits,
		placeholderText: computed(() => props.placeholder ?? maskPlaceholder(country.value.mask)),
		countries,
		handleInput: (masked: string): void => commit(onlyDigits(masked)),
		handleCountry(code: string): void {
			selectCountry(countries.value.find(item => item.code === code) as PhoneCountry)
			commit(digits.value.slice(0, maskSize(country.value.mask)))
		},
		handlePaste(event: ClipboardEvent): void {
			const pasted = pastedPhone(event.clipboardData?.getData('text') ?? '', { countries: countries.value, current: country.value })
			if (!pasted?.country) return
			event.preventDefault()
			if (pasted.country.code !== country.value.code) selectCountry(pasted.country)
			commit(pasted.digits)
		},
	}
}
