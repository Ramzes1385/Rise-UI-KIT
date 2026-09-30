import { regionName } from './phone/phoneNumber'
import { computed, reactive, ref, useId, watch } from 'vue'
import { useSelect, useSelectKeys } from '@composables/form/useSelect'
import { useScrollableRegion } from '@composables/interaction/useScrollableRegion'
import type { BaseSelectEmits } from '@components/BaseSelect/types/BaseSelect.types'
import type { PhoneCountrySelectEmits, PhoneCountrySelectProps } from '../types/PhoneCountrySelect.types'

export function usePhoneCountrySelect(props: PhoneCountrySelectProps, emit: PhoneCountrySelectEmits) {
	const listboxId = `${useId()}-countries`
	const listRef = ref<HTMLElement | null>(null)
	const optionId = (index: number): string => `${listboxId}-${index}`
	const options = computed(() =>
		props.countries.map(country => ({ value: country.code, label: regionName(country.code), description: `+${country.dialCode}` })),
	)
	const selectEmit: BaseSelectEmits = (event: 'update:modelValue' | 'change', value: string | number | (string | number)[]) => {
		if (event === 'update:modelValue') emit('update:modelValue', String(value))
	}
	const select = useSelect({
		props: reactive({ options, modelValue: computed(() => props.modelValue) }),
		emit: selectEmit,
		onBlur: () => undefined,
		isDisabled: () => props.isDisabled,
	})
	watch(select.activeIndex, index => document.getElementById(optionId(index))?.scrollIntoView({ block: 'nearest' }), { flush: 'post' })
	const current = computed(() => props.countries.find(country => country.code === props.modelValue) ?? props.countries[0])
	return {
		...select,
		...useSelectKeys({ select, isDisabled: () => props.isDisabled }),
		...useScrollableRegion({ elementRef: listRef }),
		listRef,
		listboxId,
		optionId,
		options,
		current,
		currentName: computed(() => regionName(current.value.code)),
	}
}
