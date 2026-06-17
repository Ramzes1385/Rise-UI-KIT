<template>
	<div
		class="base-radio-group"
		:class="[
			{
				'base-radio-group--error': formField.error,
			},
			variantClass,
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<FormFieldLabel
			v-if="label"
			tag="span"
			:label="label"
			:is-required="isRequired"
			class-name="base-radio-group__label"
			:custom-class="classes.label"
			required-class-name="base-radio-group__required"
			:required-custom-class="classes.required"
			:size-scale="sizeScale" />

		<div
			class="base-radio-group__options"
			:class="[{ 'base-radio-group__options--vertical': isVertical }, classes.options]">
			<label
				v-for="option in options"
				:key="option.value"
				class="base-radio"
				:class="[
					{
						'base-radio--disabled': option.isDisabled,
						'base-radio--error': formField.error,
					},
					classes.radio,
				]">
				<slot name="option" :option="option" :is-checked="modelValue === option.value">
					<div class="base-radio__wrapper" :class="classes.wrapper">
						<input
							type="radio"
							class="base-radio__input"
							:class="classes.input"
							:name="name"
							:value="option.value"
							:checked="modelValue === option.value"
							:disabled="option.isDisabled"
							@change="handleChange(option.value)" />
						<div class="base-radio__circle" :class="classes.circle">
							<div v-if="modelValue === option.value" class="base-radio__dot" :class="classes.dot"></div>
						</div>
					</div>
					<span class="base-radio__option-label" :class="classes.optionLabel">{{ option.label }}</span>
				</slot>
			</label>
		</div>

		<FormFieldError
			:error="formField.error"
			class-name="base-radio-group__error-text"
			:custom-class="classes.errorText"
			:size-scale="sizeScale" />
	</div>
</template>

<script setup lang="ts">
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useFormField } from '@composables/useFormField'
import '../styles/BaseRadio.style.scss'
import { SIZE_SCALE_DEFAULT } from '@constants'
import type { BaseRadioEmits, BaseRadioProps } from '../model/BaseRadio.types'

const props = withDefaults(defineProps<BaseRadioProps>(), {
	isVertical: false,
	isRequired: false,
	error: '',
	sizeScale: SIZE_SCALE_DEFAULT,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-radio-group', props, ['root', 'label', 'options', 'radio', 'wrapper', 'input', 'circle', 'dot', 'optionLabel', 'errorText'])

const emit = defineEmits<BaseRadioEmits>()

const formField = useFormField({
	value: () => props.modelValue,
	error: () => props.error,
	isRequired: () => props.isRequired,
})

function handleChange(value: string | number): void {
	emit('update:modelValue', value)
	emit('change', value)
}

defineExpose({
	validate: formField.validate,
	reset: formField.reset,
})
</script>
