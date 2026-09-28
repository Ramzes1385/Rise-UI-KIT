<template>
	<div
		class="base-input"
		:class="[
			variantClass,
			{
				'base-input--error': control.hasError.value,
				'base-input--disabled': isDisabled,
				'base-input--readonly': isReadonly,
				'base-input--has-prefix': prefix || $slots.prefix,
				'base-input--has-postfix': postfix || $slots.postfix,
				'base-input--password': type === 'password',
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<FormFieldLabel
			v-if="label"
			:for-id="inputId"
			:label="label"
			:is-required="isRequired"
			class-name="base-input__label"
			:custom-class="classes.label"
			required-class-name="base-input__required"
			:required-custom-class="classes.required"
			:size-scale="sizeScale" />

		<div class="base-input__wrapper" :class="classes.wrapper">
			<slot name="prefix">
				<BaseText v-if="prefix" tag="span" class="base-input__prefix" :custom-class="classes.prefix" :size-scale="sizeScale">{{
					prefix
				}}</BaseText>
			</slot>
			<input
				v-bind="nativeAttrs"
				:id="inputId"
				ref="inputRef"
				class="base-input__field"
				:class="classes.field"
				:type="inputType"
				:value="displayValue"
				:placeholder="placeholder"
				:disabled="isDisabled"
				:readonly="isReadonly"
				@input="masked.handleInput"
				@keydown="masked.handleKeydown"
				@blur="handleBlur"
				@focus="handleFocus" />
			<BaseButton
				v-if="type === 'password'"
				variant="ghost"
				class="base-input__password-toggle"
				:custom-class="classes.passwordToggle"
				tabindex="-1"
				:aria-label="isPasswordVisible ? UI_ARIA.PASSWORD_HIDE : UI_ARIA.PASSWORD_SHOW"
				:size-scale="sizeScale"
				@click="togglePasswordVisibility">
				<BaseIcon
					:name="isPasswordVisible ? 'eye-closed-icon' : 'eye-open-icon'"
					:custom-class="classes.passwordIcon"
					:size-scale="calcIconScale('sm', sizeScale)" />
			</BaseButton>
			<slot name="postfix">
				<BaseText v-if="postfix" tag="span" class="base-input__postfix" :custom-class="classes.postfix" :size-scale="sizeScale">{{
					postfix
				}}</BaseText>
			</slot>
			<slot name="suffix" />
		</div>

		<div v-if="passwordRuleResults.length > 0" class="base-input__password-rules" :class="classes.passwordRules">
			<div
				v-for="rule in passwordRuleResults"
				:key="rule.key"
				class="base-input__password-rule"
				:class="[{ 'base-input__password-rule--valid': rule.isValid }, classes.passwordRule]">
				<span class="base-input__password-rule-icon"
					><BaseIcon
						:name="rule.isValid ? 'check' : 'x-mark'"
						:custom-class="classes.passwordRuleIcon"
						:size-scale="calcIconScale('xs', sizeScale)"
				/></span>
				<span class="base-input__password-rule-label">{{ rule.label }}</span>
			</div>
		</div>

		<FormFieldError
			:id="errorId"
			:error="formField.error"
			class-name="base-input__error-text"
			:custom-class="classes.errorText"
			:size-scale="sizeScale" />
	</div>
</template>

<script setup lang="ts">
import '@components/BaseText/styles/BaseText.style.scss'
import '../styles/BaseInput.style.scss'
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { calcIconScale } from '@utils/iconUtils'
import { BaseButton } from '@components/BaseButton'
import { useBaseInput } from '../model/useBaseInput'
import { kitDefaults } from '@composables/useDefaults'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import type { BaseInputEmits, BaseInputProps, BaseInputSlots } from '../types/BaseInput.types'

const props = withDefaults(
	defineProps<BaseInputProps>(),
	kitDefaults('BaseInput', {
		variant: DEFAULT_VARIANT,
		type: 'text',
		placeholder: '',
		isDisabled: false,
		isReadonly: false,
		isRequired: false,
		sizeScale: SIZE_SCALE_DEFAULT,
		prefix: '',
		postfix: '',
		mask: '',
	}),
)
const emit = defineEmits<BaseInputEmits>()
defineSlots<BaseInputSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	inputRef,
	errorId,
	formField,
	control,
	inputId,
	nativeAttrs,
	masked,
	displayValue,
	isPasswordVisible,
	inputType,
	togglePasswordVisibility,
	passwordRuleResults,
	handleBlur,
	handleFocus,
	exposed,
} = useBaseInput(props, emit)

defineExpose(exposed)
</script>
