<template>
	<BaseInput
		class="base-phone-input"
		:class="classes.root"
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
			<span class="base-phone-input__country" :class="classes.country" :aria-disabled="isControlDisabled ? 'true' : undefined">
				<select :aria-label="UI_PHONE_INPUT.COUNTRY" :value="country.code" :disabled="isControlDisabled" @change="handleCountry">
					<option v-for="option in countryOptions" :key="option.code" :value="option.code">{{ option.label }}</option>
				</select>
				<span class="base-phone-input__dial" aria-hidden="true">+{{ country.dialCode }}</span>
				<BaseIcon name="chevron-down" />
			</span>
		</template>
	</BaseInput>
</template>

<script setup lang="ts">
import '../styles/BasePhoneInput.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { UI_PHONE_INPUT } from '@/locales/messages'
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

const { classes, isControlDisabled, country, digits, placeholderText, countryOptions, handleInput, handleCountry, handlePaste } =
	useBasePhoneInput(props, emit)
</script>
