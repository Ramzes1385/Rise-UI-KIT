<template>
	<div
		class="base-textarea"
		:class="[
			variantClass,
			{
				'base-textarea--error': formField.error,
				'base-textarea--disabled': props.isDisabled,
				'base-textarea--autosize': props.isAutosize,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<BaseText
			v-if="label"
			tag="label"
			class="base-textarea__label"
			:custom-class="classes.label"
			:size-scale="props.sizeScale">
			{{ label }}
			<BaseText
				v-if="props.isRequired"
				tag="span"
				class="base-textarea__required"
				:custom-class="classes.required"
				:size-scale="props.sizeScale"
				>*</BaseText
			>
		</BaseText>

		<textarea
			ref="textareaRef"
			class="base-textarea__field"
			:class="classes.field"
			:value="props.modelValue"
			:placeholder="props.placeholder"
			:rows="props.rows"
			:maxlength="maxlength"
			:disabled="props.isDisabled"
			:readonly="props.isReadonly"
			:name="name"
			@input="handleInput"
			@blur="handleBlur"
			@focus="handleFocus"></textarea>

		<BaseText
			v-if="formField.error"
			tag="span"
			class="base-textarea__error-text"
			:custom-class="classes.errorText"
			:size-scale="props.sizeScale"
			>{{ formField.error }}</BaseText
		>
	</div>
</template>

<script setup lang="ts">
import { BaseText } from '@components/BaseText'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useFormField } from '@composables/useFormField'
import { toHTMLTextAreaElement } from '@utils/domUtils'
import { nextTick, onMounted, ref, watch } from 'vue'
import '../styles/BaseTextarea.style.scss'
import type { BaseTextareaEmits, BaseTextareaProps } from '../model/BaseTextarea.types'

const props = withDefaults(defineProps<BaseTextareaProps>(), {
	modelValue: '',
	placeholder: '',
	rows: 4,
	isDisabled: false,
	isReadonly: false,
	isRequired: false,
	isAutosize: false,
	sizeScale: 100,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-textarea', props, ['root', 'label', 'required', 'field', 'errorText'])

const emit = defineEmits<BaseTextareaEmits>()

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

defineExpose({ textareaRef, adjustHeight, validate: formField.validate, reset: formField.reset })
</script>
