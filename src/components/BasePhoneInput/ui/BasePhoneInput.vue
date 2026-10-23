<template>
	<BaseInput
		:class="[ui('root'), classes.root]"
		:model-value="digits"
		type="tel"
		:mask="country.mask"
		:variant="variant"
		:label="label"
		:placeholder="placeholderText"
		:error="error"
		:is-disabled="isControlDisabled"
		:is-required="isRequired"
		:input-attrs="{ autocomplete: 'tel-national', inputmode: 'tel' }"
		:size-scale="sizeScale"
		:color="color"
		:custom-class="{ field: classes.field }"
		@update:model-value="handleInput"
		@paste="handlePaste">
		<template #prefix>
			<PhoneCountrySelect
				:model-value="country.code"
				:countries="countries"
				:is-disabled="isControlDisabled"
				:size-scale="sizeScale"
				:country-class="classes.country"
				:ui="ui"
				@update:model-value="handleCountry" />
		</template>
	</BaseInput>
</template>

<script setup lang="ts">
import '../styles/BasePhoneInput.style.scss'
import { BaseInput } from '@components/BaseInput'
import PhoneCountrySelect from './PhoneCountrySelect.vue'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBasePhoneInput } from '../model/useBasePhoneInput'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BasePhoneInputEmits, BasePhoneInputProps } from '../types/BasePhoneInput.types'

const props = withDefaults(
	defineProps<BasePhoneInputProps>(),
	kitDefaults('BasePhoneInput', {
		variant: DEFAULT_VARIANT,
		modelValue: '',
		country: undefined,
		countries: undefined,
		isRequired: false,
		isDisabled: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BasePhoneInputEmits>()

const { ui, classes, isControlDisabled, countries, country, digits, placeholderText, handleInput, handleCountry, handlePaste } =
	useBasePhoneInput(props, emit)
</script>
