<template>
	<div
		class="base-input"
		:class="[
			variantClass,
			{
				'base-input--error': formField.error,
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
			:label="label"
			:is-required="isRequired"
			class-name="base-input__label"
			:custom-class="classes.label"
			required-class-name="base-input__required"
			:required-custom-class="classes.required"
			:size-scale="sizeScale" />

		<div class="base-input__wrapper" :class="classes.wrapper">
			<slot name="prefix">
				<BaseText
					v-if="prefix"
					tag="span"
					class="base-input__prefix"
					:custom-class="classes.prefix"
					:size-scale="sizeScale"
					>{{ prefix }}</BaseText
				>
			</slot>
			<input
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
				<BaseText
					v-if="postfix"
					tag="span"
					class="base-input__postfix"
					:custom-class="classes.postfix"
					:size-scale="sizeScale"
					>{{ postfix }}</BaseText
				>
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
			:error="formField.error"
			class-name="base-input__error-text"
			:custom-class="classes.errorText"
			:size-scale="sizeScale" />
	</div>
</template>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useFormField } from '@composables/useFormField'
import { useMaskedInputHandlers } from '@composables/useInputMask'
import { usePasswordVisibility } from '@composables/usePasswordVisibility'
import { UI_ARIA, SIZE_SCALE_DEFAULT} from '@constants'
import '../styles/BaseInput.style.scss'
import type { BaseInputEmits, BaseInputProps, BaseInputSlots, PasswordRuleResult } from '../model/BaseInput.types'

const props = withDefaults(defineProps<BaseInputProps>(), {
	type: 'text',
	placeholder: '',
	isDisabled: false,
	isReadonly: false,
	isRequired: false,
	sizeScale: SIZE_SCALE_DEFAULT,
	prefix: '',
	postfix: '',
	mask: '',
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-input', props, [
	'root', 'label', 'required', 'wrapper', 'prefix', 'field',
	'passwordToggle', 'passwordIcon', 'postfix', 'passwordRules',
	'passwordRule', 'passwordRuleIcon', 'errorText',
])

const emit = defineEmits<BaseInputEmits>()
defineSlots<BaseInputSlots>()
const inputRef = ref<HTMLInputElement | null>(null)

const formField = useFormField({
	value: () => props.modelValue,
	error: () => props.error,
	isRequired: () => props.isRequired,
})

const masked = useMaskedInputHandlers({
	getMask: () => props.mask,
	getValue: () => props.modelValue,
	isPassword: () => props.type === 'password',
	emit: (event, value) => emit(event, value),
	onKeydown: (e) => emit('keydown', e),
	inputRef,
})

const { isPasswordVisible, inputType, togglePasswordVisibility } = usePasswordVisibility({
	type: toRef(props, 'type'),
})

const passwordRuleResults = computed<PasswordRuleResult[]>(() => {
	if (!props.passwordRules) return []
	const val = props.modelValue == null ? '' : String(props.modelValue)
	return props.passwordRules.map(rule => ({
		key: rule.key,
		label: rule.label,
		isValid: rule.validate(val),
	}))
})

const displayValue = computed(() => {
	const val = props.modelValue == null ? '' : String(props.modelValue)
	if (props.type === 'password') return val
	if (!props.mask) return val
	return masked.applyMask(val, props.mask)
})

function handleBlur(e: FocusEvent): void {
	formField.onBlur()
	emit('blur', e)
}

function handleFocus(e: FocusEvent): void {
	emit('focus', e)
}

defineExpose({
	rootRef: inputRef,
	inputRef,
	/* istanbul ignore next — defensive: optional chaining для public API на unmount */
	focus: () => inputRef.value?.focus(),
	/* istanbul ignore next — defensive: optional chaining для public API на unmount */
	blur: () => inputRef.value?.blur(),
	validate: formField.validate,
	reset: formField.reset,
})
</script>
