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
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<BaseText v-if="label" tag="label" class="base-textarea__label" :size-scale="sizeScale">
			{{ label }}
			<BaseText v-if="isRequired" tag="span" class="base-textarea__required" :size-scale="sizeScale">*</BaseText>
		</BaseText>

		<textarea
			ref="textareaRef"
			class="base-textarea__field"
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

		<BaseText v-if="error" tag="span" class="base-textarea__error-text" :size-scale="sizeScale">{{ error }}</BaseText>
	</div>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import { BaseText } from '@/shared/ui/BaseText'
import { nextTick, onMounted, ref, watch } from 'vue'
import './BaseTextarea.style.scss'
import type { BaseTextareaEmits, BaseTextareaProps } from './BaseTextarea.types'

const props = withDefaults(defineProps<BaseTextareaProps>(), {
	placeholder: '',
	rows: 4,
	variant: 'default',
	isDisabled: false,
	isReadonly: false,
	isRequired: false,
	isAutosize: false,
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-textarea', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const emit = defineEmits<BaseTextareaEmits>()
const textareaRef = ref<HTMLTextAreaElement | null>(null)

/** Автоматическая подстройка высоты под контент */
function adjustHeight(): void {
	const el = textareaRef.value
	if (!el || !props.isAutosize) return

	el.style.height = 'auto'
	el.style.height = `${el.scrollHeight}px`
}

function handleInput(e: Event): void {
	const target = e.target as HTMLTextAreaElement
	emit('update:modelValue', target.value)

	if (props.isAutosize) {
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
	() => props.modelValue,
	() => {
		if (props.isAutosize) {
			nextTick(adjustHeight)
		}
	},
)

/** Подстройка высоты при монтировании */
onMounted(() => {
	if (props.isAutosize) {
		nextTick(adjustHeight)
	}
})
</script>
