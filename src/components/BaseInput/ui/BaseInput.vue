<template>
	<div
		:class="[
			ui('root'),
			variantClass,
			{
				'base-input--error': control.hasError.value,
				'base-input--disabled': isDisabled,
				'base-input--readonly': isReadonly,
				'base-input--has-icon': iconName,
				'base-input--has-prefix': prefix || $slots.prefix,
				'base-input--has-postfix': postfix || $slots.postfix,
				'base-input--password': type === 'password',
				'base-input--clearable': isClearVisible,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<FormFieldLabel
			v-if="label"
			:for-id="inputId"
			:label="label"
			:is-required="isRequired"
			:class-name="ui('label')"
			:custom-class="classes.label"
			:required-class-name="ui('required')"
			:required-custom-class="classes.required"
			:size-scale="sizeScale" />

		<div :class="[ui('wrapper'), classes.wrapper]">
			<span v-if="iconName" :class="[ui('icon'), classes.icon]">
				<BaseIcon :name="iconName" :size-scale="calcIconScale('sm', sizeScale)" />
			</span>
			<slot name="prefix">
				<BaseText v-if="prefix" tag="span" :class="ui('prefix')" :custom-class="classes.prefix" :size-scale="sizeScale">{{
					prefix
				}}</BaseText>
			</slot>
			<input
				v-bind="nativeAttrs"
				:id="inputId"
				ref="inputRef"
				:class="[ui('field'), classes.field]"
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
				v-if="isClearVisible"
				variant="ghost"
				:class="ui('clear')"
				:custom-class="classes.clear"
				tabindex="-1"
				:aria-label="UI_ARIA.CLEAR_VALUE"
				:size-scale="sizeScale"
				@click="clearSearch">
				<BaseIcon name="x-mark" :size-scale="calcIconScale('sm', sizeScale)" />
			</BaseButton>
			<BaseButton
				v-if="type === 'password'"
				variant="ghost"
				:class="ui('password-toggle')"
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
				<BaseText v-if="postfix" tag="span" :class="ui('postfix')" :custom-class="classes.postfix" :size-scale="sizeScale">{{
					postfix
				}}</BaseText>
			</slot>
			<slot name="suffix" />
		</div>

		<Transition name="base-input-rules">
			<div v-if="passwordRuleResults.length > 0" :class="[ui('password-rules'), classes.passwordRules]">
				<div
					v-for="rule in passwordRuleResults"
					:key="rule.key"
					:class="[ui('password-rule'), { 'base-input__password-rule--valid': rule.isValid }, classes.passwordRule]">
					<span :class="ui('password-rule-icon')"
						><Transition name="base-input-rule-icon"
							><BaseIcon
								:key="rule.isValid ? 'check' : 'x-mark'"
								:name="rule.isValid ? 'check' : 'x-mark'"
								:custom-class="classes.passwordRuleIcon"
								:size-scale="calcIconScale('xs', sizeScale)" /></Transition
					></span>
					<span :class="ui('password-rule-label')">{{ rule.label }}</span>
				</div>
			</div>
		</Transition>

		<FormFieldError
			:id="errorId"
			:error="formField.error"
			:class-name="ui('error-text')"
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
import { BaseButton } from '@components/BaseButton'
import { useBaseInput } from '../model/useBaseInput'
import { calcIconScale } from '@utils/media/iconUtils'
import { kitDefaults } from '@composables/base/useDefaults'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
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
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	inputRef,
	iconName,
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
	isClearVisible,
	clearSearch,
	passwordRuleResults,
	handleBlur,
	handleFocus,
	exposed,
} = useBaseInput(props, emit)

defineExpose(exposed)
</script>
