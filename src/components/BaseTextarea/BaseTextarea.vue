<template>
	<div
		class="base-textarea"
		:class="[
			variantClass,
			{
				'base-textarea--error': error,
				'base-textarea--disabled': isDisabled,
				'base-textarea--autosize': isAutosize,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<BaseText
			v-if="label"
			tag="label"
			class="base-textarea__label"
			:custom-class="classes.label"
			:size-scale="sizeScale">
			{{ label }}
			<BaseText
				v-if="isRequired"
				tag="span"
				class="base-textarea__required"
				:custom-class="classes.required"
				:size-scale="sizeScale"
				>*</BaseText
			>
		</BaseText>

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

		<BaseText
			v-if="error"
			tag="span"
			class="base-textarea__error-text"
			:custom-class="classes.errorText"
			:size-scale="sizeScale"
			>{{ error }}</BaseText
		>
	</div>
</template>

<script setup lang="ts">
import { BaseText } from '@components/BaseText'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import './BaseTextarea.style.scss'
import type { BaseTextareaEmits, BaseTextareaProps } from './BaseTextarea.types'

const props = defineProps<BaseTextareaProps>()

const modelValue = computed(() => props.modelValue ?? '')
const placeholder = computed(() => props.placeholder ?? '')
const rows = computed(() => props.rows ?? 4)
const variant = computed(() => props.variant ?? 'default')
const isDisabled = computed(() => props.isDisabled ?? false)
const isReadonly = computed(() => props.isReadonly ?? false)
const isRequired = computed(() => props.isRequired ?? false)
const isAutosize = computed(() => props.isAutosize ?? false)
const sizeScale = computed(() => props.sizeScale ?? 100)

const { sizeScaleStyle } = useSizeScale({ getScale: () => sizeScale.value })
const { variantClass, variantStyle } = useVariant({ block: 'base-textarea', getVariant: () => variant.value })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'label', 'required', 'field', 'errorText'],
})

const emit = defineEmits<BaseTextareaEmits>()
const textareaRef = ref<HTMLTextAreaElement | null>(null)

/** Автоматическая подстройка высоты под контент */
function adjustHeight(): void {
	const el = textareaRef.value
	/* istanbul ignore next -- el всегда существует после mount, ветка !el — защитный guard */
	if (!el || !isAutosize.value) return

	el.style.height = `${el.scrollHeight}px`
}

function handleInput(e: Event): void {
	const target = e.target as HTMLTextAreaElement
	emit('update:modelValue', target.value)

	if (isAutosize.value) {
		nextTick(adjustHeight)
	}
}

function handleBlur(e: FocusEvent): void {
	emit('blur', e)
}

function handleFocus(e: FocusEvent): void {
	emit('focus', e)
}

/** Подстройка высоты при изменении значения извне */
watch(
	() => modelValue.value,
	() => {
		if (isAutosize.value) {
			nextTick(adjustHeight)
		}
	},
)

/** Подстройка высоты при монтировании */
onMounted(() => {
	if (isAutosize.value) {
		nextTick(adjustHeight)
	}
})

defineExpose({ textareaRef, adjustHeight })
</script>
