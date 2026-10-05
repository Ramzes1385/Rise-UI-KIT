<template>
	<div
		:class="[
			ui('root'),
			variantClass,
			{
				'base-textarea--error': control.hasError.value,
				'base-textarea--disabled': isDisabled,
				'base-textarea--readonly': isReadonly,
				'base-textarea--autosize': isAutosize,
				'base-textarea--has-counter': hasCounter,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<FormFieldLabel
			v-if="label"
			:for-id="textareaId"
			:label="label"
			:is-required="isRequired"
			:class-name="ui('label')"
			:custom-class="classes.label"
			:required-class-name="ui('required')"
			:required-custom-class="classes.required"
			:size-scale="sizeScale" />

		<textarea
			v-bind="nativeAttrs"
			:id="textareaId"
			ref="textareaRef"
			:class="[ui('field'), classes.field]"
			:value="modelValue"
			:placeholder="placeholder"
			:rows="rows"
			:maxlength="maxlength"
			:disabled="isDisabled"
			:readonly="isReadonly"
			@input="handleInput"
			@blur="handleBlur"
			@focus="handleFocus"></textarea>

		<FormFieldError
			:id="errorId"
			:error="formField.error"
			:class-name="ui('error-text')"
			:custom-class="classes.errorText"
			:size-scale="sizeScale" />

		<span v-if="hasCounter" :id="counterId" :class="ui('counter')">{{ characterCount }}/{{ maxlength }}</span>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseTextarea.style.scss'
import { useBaseTextarea } from '../model/useBaseTextarea'
import { kitDefaults } from '@composables/base/useDefaults'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseTextareaEmits, BaseTextareaProps, BaseTextareaSlots } from '../types/BaseTextarea.types'

const props = withDefaults(
	defineProps<BaseTextareaProps>(),
	kitDefaults('BaseTextarea', {
		variant: DEFAULT_VARIANT,
		modelValue: '',
		placeholder: '',
		rows: 4,
		isDisabled: false,
		isReadonly: false,
		isRequired: false,
		isAutosize: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
const emit = defineEmits<BaseTextareaEmits>()
defineSlots<BaseTextareaSlots>()

const {
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	errorId,
	counterId,
	formField,
	hasCounter,
	control,
	textareaId,
	characterCount,
	nativeAttrs,
	textareaRef,
	handleInput,
	handleBlur,
	handleFocus,
	exposed,
} = useBaseTextarea(props, emit)

defineExpose(exposed)
</script>
