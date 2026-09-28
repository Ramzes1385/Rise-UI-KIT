<template>
	<div
		class="base-textarea"
		:class="[
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
			class-name="base-textarea__label"
			:custom-class="classes.label"
			required-class-name="base-textarea__required"
			:required-custom-class="classes.required"
			:size-scale="sizeScale" />

		<!-- Атрибуты поля — первыми: id, значение и состояние кита их перекрывают (свой id и описание учтены в них) -->
		<textarea
			v-bind="nativeAttrs"
			:id="textareaId"
			ref="textareaRef"
			class="base-textarea__field"
			:class="classes.field"
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
			class-name="base-textarea__error-text"
			:custom-class="classes.errorText"
			:size-scale="sizeScale" />

		<!-- Счётчик символов при maxlength: стоит справа в строке под полем (слева — ошибка), поле описано им через aria-describedby -->
		<span v-if="hasCounter" :id="counterId" class="base-textarea__counter">{{ characterCount }}/{{ maxlength }}</span>
	</div>
</template>

<script setup lang="ts">
import { kitDefaults } from '@composables/useDefaults'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useBaseTextarea } from '../model/useBaseTextarea'
import '../styles/BaseTextarea.style.scss'
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
