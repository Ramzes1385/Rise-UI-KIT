<template>
	<div
		class="base-textarea"
		:class="[
			variantClass,
			{
				'base-textarea--error': formField.error,
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

		<textarea
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
			:name="name"
			:aria-invalid="formField.error ? 'true' : undefined"
			:aria-required="isRequired ? 'true' : undefined"
			:aria-describedby="describedBy"
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
import { computed, nextTick, onMounted, ref, useId, watch } from 'vue'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { kitDefaults } from '@composables/useDefaults'
import { useFormField } from '@composables/useFormField'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@constants'
import '../styles/BaseTextarea.style.scss'
import { toHTMLTextAreaElement } from '@utils/domUtils'
import type { BaseTextareaEmits, BaseTextareaProps, BaseTextareaSlots } from '../model/BaseTextarea.types'

const props = withDefaults(defineProps<BaseTextareaProps>(), kitDefaults('BaseTextarea', {
	variant: DEFAULT_VARIANT,
	modelValue: '',
	placeholder: '',
	rows: 4,
	isDisabled: false,
	isReadonly: false,
	isRequired: false,
	isAutosize: false,
	sizeScale: SIZE_SCALE_DEFAULT,
}))

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-textarea', props, ['root', 'label', 'required', 'field', 'errorText'])

const emit = defineEmits<BaseTextareaEmits>()

defineSlots<BaseTextareaSlots>()

/** id поля, текста ошибки и счётчика: метка связана с полем через for, ошибка и счётчик — через aria-describedby */
const textareaId = useId()
const errorId = `${textareaId}-error`
const counterId = `${textareaId}-counter`

const formField = useFormField({
	value: () => props.modelValue,
	error: () => props.error,
	isRequired: () => props.isRequired,
})

/** Счётчик «введено/максимум» показывается, когда задан maxlength */
const hasCounter = computed(() => Boolean(props.maxlength && props.maxlength > 0))
const characterCount = computed(() => props.modelValue?.length ?? 0)

/** Что описывает поле: текст ошибки и счётчик символов (если есть) */
const describedBy = computed(() => {
	const ids = [formField.error ? errorId : '', hasCounter.value ? counterId : ''].filter(Boolean)
	return ids.length > 0 ? ids.join(' ') : undefined
})

const textareaRef = ref<HTMLTextAreaElement | null>(null)

/**
 * Подгоняет высоту под текст. Высота сначала сбрасывается в auto: иначе scrollHeight не меньше текущей высоты
 * и поле только растёт. У поля box-sizing: border-box, поэтому к scrollHeight (текст + отступы) добавляются рамки.
 */
function adjustHeight(): void {
	const el = textareaRef.value
	/* istanbul ignore next -- el всегда существует после mount, ветка !el — защитный guard */
	if (!el || !props.isAutosize) return

	el.style.height = 'auto'
	const { borderTopWidth, borderBottomWidth } = getComputedStyle(el)
	const borders = (Number.parseFloat(borderTopWidth) || 0) + (Number.parseFloat(borderBottomWidth) || 0)
	el.style.height = `${el.scrollHeight + borders}px`
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

// Включение autosize подгоняет высоту сразу, выключение возвращает высоту по rows (и ручное изменение размера)
watch(
	() => props.isAutosize,
	isAutosize => {
		if (isAutosize) {
			nextTick(adjustHeight)
		} else if (textareaRef.value) {
			textareaRef.value.style.height = ''
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
