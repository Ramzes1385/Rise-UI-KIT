<template>
	<div
		class="base-textarea"
		:class="[
			variantClass,
			{
				'base-textarea--error': formField.error,
				'base-textarea--disabled': isDisabled,
				'base-textarea--autosize': isAutosize,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<FormFieldLabel
			v-if="label"
			:label="label"
			:is-required="isRequired"
			class-name="base-textarea__label"
			:custom-class="classes.label"
			required-class-name="base-textarea__required"
			:required-custom-class="classes.required"
			:size-scale="sizeScale" />

		<textarea
			ref="textareaRef"
			class="base-textarea__field"
			:class="classes.field"
			:value="modelValue"
			:placeholder="placeholder"
			:rows="rows"
			:maxlength="maxlength"
			:disabled="isDisabled"
			:readonly="isReadonly"
			:name="name"
			@input="handleInput"
			@blur="handleBlur"
			@focus="handleFocus"></textarea>

		<FormFieldError
			:error="formField.error"
			class-name="base-textarea__error-text"
			:custom-class="classes.errorText"
			:size-scale="sizeScale" />
	</div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useFormField } from '@composables/useFormField'
import { SIZE_SCALE_DEFAULT } from '@constants'
import '../styles/BaseTextarea.style.scss'
import { toHTMLTextAreaElement } from '@utils/domUtils'
import type { BaseTextareaEmits, BaseTextareaProps, BaseTextareaSlots } from '../model/BaseTextarea.types'

const props = withDefaults(defineProps<BaseTextareaProps>(), {
	modelValue: '',
	placeholder: '',
	rows: 4,
	isDisabled: false,
	isReadonly: false,
	isRequired: false,
	isAutosize: false,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-textarea', props, ['root', 'label', 'required', 'field', 'errorText'])

const emit = defineEmits<BaseTextareaEmits>()

defineSlots<BaseTextareaSlots>()

const formField = useFormField({
	value: () => props.modelValue,
	error: () => props.error,
	isRequired: () => props.isRequired,
})

const textareaRef = ref<HTMLTextAreaElement | null>(null)

function adjustHeight(): void {
	const el = textareaRef.value
	/* istanbul ignore next -- el всегда существует после mount, ветка !el — защитный guard */
	if (!el || !props.isAutosize) return

	el.style.height = `${el.scrollHeight}px`
}

function handleInput(e: Event): void {
	const target = toHTMLTextAreaElement(e.target)
	if (!target) return
	emit('update:modelValue', target.value)

	if (props.isAutosize) {
		nextTick(adjustHeight)
	}
}

function handleBlur(e: FocusEvent): void {
	formField.onBlur()
	emit('blur', e)
}

function handleFocus(e: FocusEvent): void {
	emit('focus', e)
}

watch(
	() => props.modelValue,
	() => {
		if (props.isAutosize) {
			nextTick(adjustHeight)
		}
	},
)

onMounted(() => {
	if (props.isAutosize) {
		nextTick(adjustHeight)
	}
})

defineExpose({
	rootRef: textareaRef,
	textareaRef,
	adjustHeight,
	focus: () => textareaRef.value?.focus(),
	blur: () => textareaRef.value?.blur(),
	validate: formField.validate,
	reset: formField.reset,
})
</script>
