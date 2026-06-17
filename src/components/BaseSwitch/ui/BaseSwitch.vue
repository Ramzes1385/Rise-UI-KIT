<template>
	<div
		class="base-switch"
		:class="[
			classes.root,
			variantClass,
			{
				'base-switch--error': formField.error,
				'base-switch--disabled': isDisabled,
				'base-switch--reverse': reverse,
			},
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<label class="base-switch__row" :class="classes.row" :for="inputId">
			<span class="base-switch__wrapper" :class="classes.wrapper">
				<input
					:id="inputId"
					type="checkbox"
					class="base-switch__input"
					:class="classes.input"
					:checked="modelValue"
					:disabled="isDisabled"
					@change="handleChange" />
				<span class="base-switch__slider" :class="classes.slider">
					<span class="base-switch__handle" :class="classes.handle"></span>
				</span>
			</span>
			<span class="base-switch__content" :class="classes.content">
				<slot name="label">
					<FormFieldLabel
						v-if="label"
						tag="span"
						:label="label"
						class-name="base-switch__label"
						:custom-class="classes.label"
						:size-scale="sizeScale" />
				</slot>
				<BaseText
					v-if="isRequired"
					tag="span"
					class="base-switch__required"
					:custom-class="classes.required"
					:size-scale="sizeScale"
					>*</BaseText
				>
				<slot />
			</span>
		</label>
		<slot name="error">
			<FormFieldError
				:error="formField.error"
				class-name="base-switch__error-text"
				:custom-class="classes.errorText"
				:size-scale="sizeScale" />
		</slot>
	</div>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { BaseText } from '@components/BaseText'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useFormField } from '@composables/useFormField'
import { SIZE_SCALE_DEFAULT } from '@constants'
import { toHTMLInputElement } from '@utils/domUtils'
import '../styles/BaseSwitch.style.scss'
import type { BaseSwitchEmits, BaseSwitchProps } from '../model/BaseSwitch.types'

const props = withDefaults(defineProps<BaseSwitchProps>(), {
	modelValue: false,
	isDisabled: false,
	isRequired: false,
	reverse: false,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const inputId = useId()
const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-switch', props, ['root', 'row', 'wrapper', 'input', 'slider', 'handle', 'content', 'label', 'required', 'errorText'])

const emit = defineEmits<BaseSwitchEmits>()

const formField = useFormField({
	value: () => props.modelValue,
	error: () => props.error,
	isRequired: () => props.isRequired,
})

function handleChange(e: Event): void {
	const target = toHTMLInputElement(e.target)
	if (!target) return
	emit('update:modelValue', target.checked)
	emit('change', target.checked)
}

defineExpose({
	validate: formField.validate,
	reset: formField.reset,
})
</script>
